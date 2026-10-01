// Pengendali Chrome headless lewat Chrome DevTools Protocol (tanpa library), untuk pengujian black-box.
import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const DEFAULT_CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";

export async function launchBrowser({ baseUrl, downloadPath, port = 9333, chromePath = process.env.CHROME_PATH ?? DEFAULT_CHROME }) {
  const profile = mkdtempSync(join(tmpdir(), "boowat-blackbox-"));
  // Folder unduhan diatur lewat preferensi profil sementara, agar file uji tidak masuk ke folder Downloads pengguna.
  mkdirSync(join(profile, "Default"), { recursive: true });
  writeFileSync(
    join(profile, "Default", "Preferences"),
    JSON.stringify({ download: { default_directory: resolve(downloadPath), prompt_for_download: false } }),
  );
  const chrome = spawn(chromePath, [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    "--no-first-run",
    "--disable-gpu",
    "about:blank",
  ]);

  let targets = [];
  for (let attempt = 0; attempt < 40 && targets.length === 0; attempt += 1) {
    await sleep(250);
    targets = await fetch(`http://127.0.0.1:${port}/json/list`)
      .then((res) => res.json())
      .catch(() => []);
  }
  const page = targets.find((target) => target.type === "page");
  if (!page) throw new Error("Chrome tidak dapat dijalankan untuk pengujian.");

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve) => ws.addEventListener("open", resolve, { once: true }));
  let seq = 0;
  const pending = new Map();
  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      pending.get(message.id)(message);
      pending.delete(message.id);
    }
  });
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = ++seq;
      pending.set(id, (m) => (m.error ? reject(new Error(`${method}: ${m.error.message}`)) : resolve(m.result)));
      ws.send(JSON.stringify({ id, method, params }));
    });
  const evaluate = async (expression) =>
    (await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })).result.value;

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Network.enable");

  const browser = {
    evaluate,
    close: () => {
      ws.close();
      chrome.kill();
    },
    viewport: (width, height) => send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false }),
    goto: async (path, wait = 2500) => {
      await send("Page.navigate", { url: baseUrl + path });
      await sleep(wait);
    },
    path: () => evaluate("location.pathname"),
    search: () => evaluate("location.search"),
    text: () => evaluate("document.body.innerText"),
    waitFor: async (check, timeout = 10000) => {
      const start = Date.now();
      while (Date.now() - start < timeout) {
        if (await check()) return true;
        await sleep(250);
      }
      return false;
    },
    // Mengetik lewat event keyboard asli agar react-hook-form membaca nilainya.
    type: async (selector, text) => {
      await evaluate(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); el.focus(); el.select?.(); })()`);
      await send("Input.insertText", { text });
    },
    click: (selector) => evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`),
    clickText: (text, scope = "button, a, [role=menuitem], [role=tab], [role=option]") =>
      evaluate(
        `(() => { const el = [...document.querySelectorAll(${JSON.stringify(scope)})].find((e) => e.offsetParent !== null && e.textContent.trim().includes(${JSON.stringify(text)})); if (!el) throw new Error("Elemen tidak ditemukan: ${text}"); el.click(); })()`,
      ),
    // Komponen Select (Radix) terbuka lewat pointerdown, bukan click.
    choose: async (triggerSelector, optionText) => {
      await evaluate(
        `(() => { const el = document.querySelector(${JSON.stringify(triggerSelector)}); const o = { bubbles: true, button: 0, pointerType: "mouse" }; el.dispatchEvent(new PointerEvent("pointerdown", o)); el.dispatchEvent(new PointerEvent("pointerup", o)); el.click(); })()`,
      );
      await sleep(500);
      await browser.clickText(optionText, "[role=option]");
      await sleep(500);
    },
    // fullPage: tinggi viewport sementara disamakan dengan tinggi konten agar seluruh halaman terekam.
    screenshot: async (file, { fullPage = false } = {}) => {
      const size = await evaluate("({ width: window.innerWidth, height: window.innerHeight })");
      if (fullPage) {
        const height = await evaluate("document.documentElement.scrollHeight");
        await send("Emulation.setDeviceMetricsOverride", { width: size.width, height, deviceScaleFactor: 1, mobile: false });
        await sleep(600);
      }
      const { data } = await send("Page.captureScreenshot", { format: "jpeg", quality: 82 });
      writeFileSync(file, Buffer.from(data, "base64"));
      if (fullPage) await send("Emulation.setDeviceMetricsOverride", { ...size, deviceScaleFactor: 1, mobile: false });
    },
    login: async (email, password) => {
      await send("Network.clearBrowserCookies");
      await browser.goto("/login");
      await browser.type("#email", email);
      await browser.type("#password", password);
      await browser.click("button[type=submit]");
      await sleep(3000);
    },
    logout: () => send("Network.clearBrowserCookies"),
  };
  return browser;
}
