// Screenshot tampilan hasil implementasi (lampiran Gambar 4.1–4.8 BAB IV) dari data seed.
// Prasyarat: `pnpm prisma db seed` lalu `pnpm build && pnpm start`. Jalankan: `node scripts/e2e/screenshots.mjs`.
import { mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { apiSession } from "./api.mjs";
import { launchBrowser, sleep } from "./browser.mjs";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = fileURLToPath(new URL("../../docs/bab4/implementasi/", import.meta.url));
mkdirSync(OUT, { recursive: true });

const ADMIN = ["admin@boowat.com", "admin123"];
const KLIEN2 = ["klien2@contoh.com", "klien123"];

const admin = await apiSession(BASE, ...ADMIN);
const clients = (await admin("/api/clients")).body.data;
const projects = (await admin("/api/projects")).body.data;
const invoices = (await admin("/api/invoices")).body.data;
const kopi = clients.find((c) => c.company === "CV Kopi Nusantara");
const toko = projects.find((p) => p.name.startsWith("Pembuatan Website"));
const sentInvoice = invoices.find((i) => i.status === "SENT");

const scrollToThread = `document.querySelector("[id^=message-]")?.scrollIntoView({ block: "center" })`;
const pages = [
  { file: "gambar-4-1-admin-kelola-klien", account: ADMIN, path: `/admin/clients/${kopi.id}?tab=website` },
  { file: "gambar-4-2-admin-komunikasi-proyek", account: ADMIN, path: `/admin/projects/${toko.id}?tab=pesan` },
  { file: "gambar-4-3-admin-invoice", account: ADMIN, path: `/admin/invoices/${sentInvoice.id}` },
  { file: "gambar-4-4-admin-permintaan", account: ADMIN, path: "/admin/requests" },
  { file: "gambar-4-5-klien-data-website", account: KLIEN2, path: "/portal", fullPage: true },
  { file: "gambar-4-6-klien-komunikasi-proyek", account: KLIEN2, path: `/portal/projects/${toko.id}`, before: scrollToThread },
  { file: "gambar-4-7-klien-invoice", account: KLIEN2, path: "/portal/invoices" },
  { file: "gambar-4-8-klien-ajukan-permintaan", account: KLIEN2, path: "/portal/requests/new" },
  { file: "tambahan-halaman-login", account: null, path: "/login" },
  { file: "tambahan-beranda-admin", account: ADMIN, path: "/admin", fullPage: true },
  { file: "tambahan-kanban-sprint", account: ADMIN, path: `/admin/projects/${toko.id}?tab=sprint`, fullPage: true },
];

const b = await launchBrowser({ baseUrl: BASE, downloadPath: tmpdir() });
await b.viewport(1440, 900);
let current = undefined;
for (const page of pages) {
  if (page.account !== current) {
    if (page.account) await b.login(...page.account);
    else await b.logout();
    current = page.account;
  }
  await b.goto(page.path, 3000);
  if (page.before) {
    await b.evaluate(page.before);
    await sleep(800);
  }
  await b.screenshot(`${OUT}${page.file}.jpg`, { fullPage: page.fullPage });
  console.info(`tersimpan: docs/bab4/implementasi/${page.file}.jpg`);
}
b.close();
