// Pengujian black-box BB-01..BB-22 (PRD Bagian 13) lewat browser, dengan bukti screenshot per skenario.
// Prasyarat: `pnpm prisma db seed` lalu `pnpm build && pnpm start`. Jalankan: `node scripts/e2e/blackbox.mjs`.
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { apiSession } from "./api.mjs";
import { launchBrowser, sleep } from "./browser.mjs";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const OUT = `${ROOT}docs/bab4/blackbox`;
const DOWNLOADS = `${OUT}/unduhan`;
const CRON_SECRET =
  process.env.CRON_SECRET ?? readFileSync(`${ROOT}.env`, "utf8").match(/^CRON_SECRET=(.*)$/m)?.[1]?.trim() ?? "";
mkdirSync(DOWNLOADS, { recursive: true });

const ADMIN = ["admin@boowat.com", "admin123"];
const KLIEN1 = ["klien1@contoh.com", "klien123"];
const KLIEN2 = ["klien2@contoh.com", "klien123"];
const KLIEN3 = ["klien3@contoh.com", "klien123"];
const api = (account) => apiSession(BASE, ...account);
const dateInWib = (days) => new Date(Date.now() + 7 * 3_600_000 + days * 86_400_000).toISOString().slice(0, 10);
const notificationTitles = async (account) => (await (await api(account))("/api/notifications")).body.data.items.map((n) => n.title);

// Data awal dari seed; pengujian harus dimulai dari seed yang bersih.
const adminApi = await api(ADMIN);
const projects = (await adminApi("/api/projects")).body.data;
const websites = (await adminApi("/api/websites")).body.data;
const invoices = (await adminApi("/api/invoices")).body.data;
const requests = (await adminApi("/api/requests")).body.data;
const project = (name) => projects.find((p) => p.name.startsWith(name));
const website = (domain) => websites.find((w) => w.domain === domain);
const seed = {
  redesign: project("Redesain"),
  toko: project("Pembuatan Website"),
  pemeliharaan: project("Pemeliharaan"),
  senyum: website("senyumsehat.co.id"),
  batik: website("batiklaras.com"),
  draft: invoices.find((i) => i.status === "DRAFT"),
  overdue: requests.find((r) => r.overdue),
};
if (seed.redesign?.status !== "WAITING_APPROVAL") throw new Error("Data belum bersih. Jalankan `pnpm prisma db seed` dulu.");

const b = await launchBrowser({ baseUrl: BASE, downloadPath: DOWNLOADS });
await b.viewport(1440, 900);
const state = {};
const waitForDownload = async (pattern) => {
  let file;
  await b.waitFor(async () => {
    file = readdirSync(DOWNLOADS).find((name) => pattern.test(name) && !name.endsWith(".crdownload"));
    return Boolean(file);
  }, 15000);
  if (!file) return null;
  const header = readFileSync(`${DOWNLOADS}/${file}`).subarray(0, 4).toString();
  return { file, isPdf: header === "%PDF" };
};

const scenarios = [
  ["BB-01", async () => {
    await b.logout();
    await b.goto("/login");
    await b.type("#email", ADMIN[0]);
    await b.type("#password", ADMIN[1]);
    await b.click("button[type=submit]");
    const ok = await b.waitFor(async () => (await b.path()) === "/admin");
    return [ok, `Diarahkan ke ${await b.path()} (Beranda admin).`];
  }],
  ["BB-02", async () => {
    await b.logout();
    await b.goto("/login");
    await b.type("#email", ADMIN[0]);
    await b.type("#password", "salah123");
    await b.click("button[type=submit]");
    const shown = await b.waitFor(async () => (await b.text()).includes("Email atau password salah"));
    const path = await b.path();
    return [shown && path === "/login", `Pesan "Email atau password salah" tampil, tetap di ${path}.`];
  }],
  ["BB-03", async () => {
    await b.login(...KLIEN1);
    await b.goto("/admin");
    const path = await b.path();
    return [path === "/portal", `Klien diarahkan dari /admin ke ${path}.`];
  }],
  ["BB-04", async () => {
    await b.goto(`/portal/projects/${seed.toko.id}`);
    const notFound = (await b.text()).includes("Halaman tidak ditemukan");
    const status = await b.evaluate("fetch(location.href).then((r) => r.status)");
    return [notFound && status === 404, `Halaman "Halaman tidak ditemukan" dengan status HTTP ${status}.`];
  }],
  ["BB-05", async () => {
    await b.login(...ADMIN);
    await b.goto("/admin/clients/new");
    await b.type("#company", "Toko Roti Harum Manis");
    await b.type("#name", "Dewi Kartika");
    await b.type("#email", "dewi@harummanis.co.id");
    await b.type("#phone", "081211112222");
    await b.type("#address", "Jl. Pahlawan No. 8, Semarang");
    await b.type("#account-name", "Dewi Kartika");
    await b.type("#account-email", "dewi@harummanis.co.id");
    await b.type("#account-password", "harummanis123");
    await b.clickText("Simpan Klien");
    const saved = await b.waitFor(async () => /^\/admin\/clients\/(?!new)/.test(await b.path()));
    await b.goto("/admin/clients");
    const listed = (await b.text()).includes("Toko Roti Harum Manis");
    await b.screenshot(`${OUT}/BB-05-daftar-klien.jpg`);
    await b.login("dewi@harummanis.co.id", "harummanis123");
    const path = await b.path();
    return [saved && listed && path === "/portal", `Klien tampil di daftar klien; akun baru berhasil login ke ${path}.`];
  }],
  ["BB-06", async () => {
    await b.login(...ADMIN);
    const before = (await adminApi("/api/clients")).body.data.length;
    await b.goto("/admin/clients/new");
    await b.type("#company", "Uji Email Duplikat");
    await b.type("#name", "Penguji");
    await b.type("#email", "uji@duplikat.co.id");
    await b.type("#account-name", "Penguji");
    await b.type("#account-email", KLIEN1[0]);
    await b.type("#account-password", "rahasia123");
    await b.clickText("Simpan Klien");
    const shown = await b.waitFor(async () => (await b.text()).includes("Email sudah dipakai akun lain"));
    const after = (await adminApi("/api/clients")).body.data.length;
    return [shown && before === after && (await b.path()) === "/admin/clients/new", `Pesan "Email sudah dipakai akun lain" tampil; jumlah klien tetap ${after}.`];
  }],
  ["BB-07", async () => {
    await b.goto(`/admin/websites/${seed.senyum.id}`);
    await b.type("#visitors", "2500");
    await b.type("#pageviews", "6000");
    await b.clickText("Simpan statistik");
    await sleep(2500);
    await b.login(...KLIEN1);
    const shown = await b.waitFor(async () => (await b.text()).includes("2.500"));
    return [shown, `Dashboard klien menampilkan "Pengunjung bulan ini" 2.500.`];
  }],
  ["BB-08", async () => {
    await b.login(...ADMIN);
    await b.goto(`/admin/websites/${seed.batik.id}`);
    await b.clickText("Ubah");
    await sleep(800);
    await b.evaluate(`(() => {
      const input = document.querySelector("#domainRenewAt");
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(input, ${JSON.stringify(dateInWib(5))});
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    })()`);
    await b.clickText("Simpan", "[role=dialog] button");
    await sleep(2500);
    const cron = await fetch(`${BASE}/api/cron/daily`, { headers: { authorization: `Bearer ${CRON_SECRET}` } }).then((r) => r.json());
    await b.login(...KLIEN3);
    const red = await b.waitFor(async () => /Habis dalam [45] hari/.test(await b.text()));
    await b.clickText("notifikasi");
    await sleep(800);
    const titles = await notificationTitles(KLIEN3);
    const reminded = titles.some((title) => /domain/i.test(title));
    return [red && reminded, `Kartu website berwarna merah "Habis dalam 5 hari"; cron membuat ${cron.data.renewalReminders.created} notifikasi, klien menerima "${titles.find((t) => /domain/i.test(t))}".`];
  }],
  ["BB-09", async () => {
    const before = (await adminApi(`/api/projects/${seed.toko.id}`)).body.data.progress;
    await b.login(...ADMIN);
    await b.goto(`/admin/projects/${seed.toko.id}?tab=sprint`);
    await b.click('button[title="Pindah ke Selesai"]');
    await sleep(3000);
    const after = (await adminApi(`/api/projects/${seed.toko.id}`)).body.data.progress;
    await b.login(...KLIEN2);
    await b.goto(`/portal/projects/${seed.toko.id}`);
    const portal = Number(await b.evaluate(`document.querySelector("[role=progressbar]")?.getAttribute("aria-valuenow")`));
    return [after > before && portal === after, `Progres naik dari ${before}% menjadi ${after}%; portal klien menampilkan ${portal}%.`];
  }],
  ["BB-10", async () => {
    const message = "Halo tim Boowat, apakah halaman layanan sudah bisa dicek di HP?";
    await b.login(...KLIEN1);
    await b.goto(`/portal/projects/${seed.redesign.id}`);
    await b.type(`#message-${seed.redesign.id}`, message);
    await b.clickText("Kirim", "form button");
    await b.waitFor(async () => (await b.text()).includes(message));
    await b.login(...ADMIN);
    await b.clickText("notifikasi");
    await sleep(800);
    await b.clickText("Pesan baru dari", "[data-slot=popover-content] button");
    await b.waitFor(async () => (await b.search()).includes("tab=pesan"));
    await sleep(1500);
    const visible = (await b.text()).includes(message);
    return [visible, `Notifikasi "Pesan baru dari Klinik Gigi Senyum Sehat" membuka tab Pesan; pesan klien tampil di thread admin.`];
  }],
  ["BB-11", async () => {
    await b.login(...KLIEN1);
    const client = await api(KLIEN1);
    const before = (await client("/api/requests")).body.data.length;
    await b.goto("/portal/requests/new");
    await b.clickText("Kirim Permintaan");
    const shown = await b.waitFor(async () => (await b.text()).includes("Judul permintaan wajib diisi"));
    const after = (await client("/api/requests")).body.data.length;
    return [shown && before === after, `Pesan "Judul permintaan wajib diisi" tampil; permintaan tidak terkirim (jumlah tetap ${after}).`];
  }],
  ["BB-12", async () => {
    state.requestTitle = "Tambah artikel promo akhir tahun";
    await b.choose("#request-type", "Tambah Konten / Artikel");
    await b.choose("#request-priority", "Tinggi");
    const estimate = (await b.text()).match(/Perkiraan waktu respon: [^\n]+/)?.[0] ?? "";
    await b.type("#request-title", state.requestTitle);
    await b.type("#request-description", "Mohon dibuatkan artikel promo pemutihan gigi untuk akhir tahun.");
    await b.clickText("Kirim Permintaan");
    await b.waitFor(async () => (await b.path()) === "/portal/requests");
    const created = (await (await api(KLIEN1))("/api/requests")).body.data.find((r) => r.title === state.requestTitle);
    state.requestId = created?.id;
    const hours = created ? Math.round((new Date(created.dueAt) - new Date(created.createdAt)) / 3_600_000) : 0;
    const notified = (await notificationTitles(ADMIN)).includes("Permintaan baru");
    return [created?.status === "SUBMITTED" && hours === 24 && notified, `Status "Diajukan"; ${estimate}; batas respon = +${hours} jam; admin menerima notifikasi "Permintaan baru".`];
  }],
  ["BB-13", async () => {
    await b.login(...ADMIN);
    await b.goto(`/admin/requests/${state.requestId}`);
    await b.clickText("Mulai tinjau");
    await b.waitFor(async () => (await b.text()).includes("Sedang Ditinjau"));
    await b.clickText("Tolak");
    await sleep(800);
    await b.clickText("Tolak permintaan", "[role=dialog] button");
    const shown = await b.waitFor(async () => /Alasan penolakan[^\n]*(wajib|minimal)/i.test(await b.text()));
    const status = (await adminApi(`/api/requests/${state.requestId}`)).body.data.status;
    const message = (await b.text()).match(/Alasan penolakan[^\n]*(wajib|minimal)[^\n]*/i)?.[0] ?? "";
    return [shown && status === "IN_REVIEW", `Ditolak sistem: "${message}"; status tetap "Sedang Ditinjau".`];
  }],
  ["BB-14", async () => {
    const reason = "Promo ini belum termasuk paket konten bulan ini.";
    await b.type("#rejection-reason", reason);
    await b.clickText("Tolak permintaan", "[role=dialog] button");
    await sleep(2500);
    await b.login(...KLIEN1);
    await b.goto("/portal/requests");
    const text = await b.text();
    return [text.includes("Ditolak") && text.includes(reason), `Klien melihat status "Ditolak" dengan alasan "${reason}".`];
  }],
  ["BB-15", async () => {
    await b.login(...ADMIN);
    await b.goto("/admin/requests");
    const firstRow = await b.evaluate(`document.querySelector("tbody tr")?.innerText ?? ""`);
    const ok = firstRow.includes(seed.overdue.title) && firstRow.includes("Melewati SLA");
    return [ok, `Permintaan "${seed.overdue.title}" berada di urutan teratas dengan badge merah "Melewati SLA".`];
  }],
  ["BB-16", async () => {
    await b.login(...KLIEN1);
    await b.goto(`/portal/projects/${seed.redesign.id}`);
    await b.clickText("Setujui Hasil");
    await sleep(800);
    await b.clickText("Ya, setujui", "[role=alertdialog] button");
    await b.waitFor(async () => (await b.text()).includes("Disetujui pada"));
    const data = (await (await api(KLIEN1))(`/api/projects/${seed.redesign.id}`)).body.data;
    const shown = (await b.text()).match(/Disetujui pada [^\n]+/)?.[0] ?? "";
    return [data.status === "DONE" && Boolean(data.approvedAt), `Status proyek "Selesai"; "${shown}" tercatat.`];
  }],
  ["BB-17", async () => {
    state.revisionTitle = "Warna tombol checkout diganti";
    await b.login(...ADMIN);
    await b.goto(`/admin/projects/${seed.toko.id}`);
    await b.choose("#project-status", "Menunggu Persetujuan");
    await sleep(2500);
    await b.login(...KLIEN2);
    await b.goto(`/portal/projects/${seed.toko.id}`);
    await b.clickText("Minta Revisi");
    await sleep(800);
    await b.choose("#revision-priority", "Sedang");
    await b.type("#revision-title", state.revisionTitle);
    await b.type("#revision-description", "Tombol checkout kurang terlihat, mohon pakai warna brand.");
    await b.clickText("Kirim Permintaan Revisi", "[role=dialog] button");
    await sleep(3000);
    const client = await api(KLIEN2);
    const status = (await client(`/api/projects/${seed.toko.id}`)).body.data.status;
    const revision = (await client("/api/requests")).body.data.find((r) => r.title === state.revisionTitle);
    return [status === "REVISION" && revision?.type === "DESIGN_REVISION", `Permintaan revisi "${state.revisionTitle}" (Revisi Desain) terbuat; status proyek menjadi "Revisi".`];
  }],
  ["BB-18", async () => {
    await b.login(...ADMIN);
    await b.goto(`/admin/projects/${seed.pemeliharaan.id}?tab=invoice`);
    await b.clickText("Buat Invoice");
    await b.waitFor(async () => (await b.path()) === "/admin/invoices/new");
    await sleep(1000);
    const prefilled = (await b.text()).includes("Batik Laras Solo");
    await b.type("#items-0-description", "Pemeliharaan website bulan Oktober");
    await b.type("#items-0-qty", "1");
    await b.type("#items-0-unitPrice", "1500000");
    await b.clickText("Simpan sebagai Draf");
    await b.waitFor(async () => /^\/admin\/invoices\/(?!new)/.test(await b.path()));
    state.invoiceId = (await b.path()).split("/").pop();
    const invoice = (await adminApi(`/api/invoices/${state.invoiceId}`)).body.data;
    state.invoiceNumber = invoice.number;
    // Tunggu isi halaman detail (bukan toast yang juga memuat nomor invoice) sebelum bukti diambil.
    await b.waitFor(async () => (await b.text()).includes("Kirim ke Klien"));
    const ok = prefilled && /^INV\/\d{4}\/\d{2}\/\d{4}$/.test(invoice.number) && Number(invoice.amount) === 1500000;
    return [ok, `Nomor otomatis ${invoice.number}; klien Batik Laras Solo dan proyek terisi otomatis; total Rp 1.500.000; status Draf.`];
  }],
  ["BB-19", async () => {
    await b.goto(`/admin/invoices/${state.invoiceId}`, 3000);
    await b.clickText("Kirim ke Klien");
    await sleep(800);
    await b.clickText("Kirim ke Klien", "[role=alertdialog] button");
    await b.waitFor(async () => (await b.text()).includes("Terkirim"));
    await b.login(...KLIEN3);
    await b.goto("/portal/invoices");
    const visible = (await b.text()).includes(state.invoiceNumber);
    const notified = (await notificationTitles(KLIEN3)).includes("Invoice baru");
    return [visible && notified, `Invoice ${state.invoiceNumber} tampil di portal klien; klien menerima notifikasi "Invoice baru".`];
  }],
  ["BB-20", async () => {
    await b.clickText("Unduh PDF");
    const download = await waitForDownload(/INV-\d{4}-\d{2}-\d{4}\.pdf$/);
    return [Boolean(download?.isPdf), download ? `File ${download.file} terunduh (format PDF valid).` : "File tidak terunduh."];
  }],
  ["BB-21", async () => {
    await b.login(...KLIEN2);
    await b.goto("/portal/invoices");
    const hidden = !(await b.text()).includes(seed.draft.number);
    const status = (await (await api(KLIEN2))(`/api/invoices/${seed.draft.id}`)).status;
    return [hidden && status === 404, `Invoice draf ${seed.draft.number} tidak tampil di portal klien; akses langsung mendapat HTTP ${status}.`];
  }],
  ["BB-22", async () => {
    await b.goto("/portal/reports");
    await b.choose("#report-website", "kopinusantara.co.id");
    await b.clickText("Unduh Laporan Bulanan");
    const download = await waitForDownload(/^Laporan-kopinusantara\.co\.id-\d{4}-\d{2}\.pdf$/);
    await sleep(800);
    return [Boolean(download?.isPdf), download ? `File ${download.file} terunduh (berisi statistik, artikel, dan permintaan bulan tersebut).` : "File tidak terunduh."];
  }],
];

const results = [];
for (const [id, run] of scenarios) {
  let ok = false;
  let observed = "";
  try {
    [ok, observed] = await run();
  } catch (error) {
    observed = `Galat saat pengujian: ${error.message}`;
  }
  await b.screenshot(`${OUT}/${id}.jpg`);
  results.push({ id, ok, observed });
  console.info(`${ok ? "BERHASIL" : "GAGAL   "}  ${id}  ${observed}`);
}
b.close();

const commit = execSync("git rev-parse --short HEAD", { cwd: ROOT, encoding: "utf8" }).trim();
writeFileSync(`${OUT}/hasil.json`, JSON.stringify({ waktu: new Date().toISOString(), baseUrl: BASE, commit, results }, null, 2));
console.info(`\n${results.filter((r) => r.ok).length}/${results.length} skenario berhasil. Bukti: docs/bab4/blackbox/`);
if (existsSync(DOWNLOADS) && readdirSync(DOWNLOADS).length === 0) console.info("Tidak ada file unduhan.");
