import { fail, ok } from "@/lib/api";
import { syncGa4Stats } from "@/lib/integrations/ga4";
import { markOverdueInvoices } from "@/lib/invoice-overdue";
import { sendRenewalReminders } from "@/lib/renewal-reminders";

// Vercel Cron memanggil endpoint ini tanpa session, dengan header Authorization berisi CRON_SECRET.
function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret) && request.headers.get("authorization") === `Bearer ${secret}`;
}

// Setiap tugas harian berdiri sendiri dan aman dijalankan berulang; tugas baru cukup ditambahkan sebagai langkah berikutnya.
export async function GET(request: Request) {
  if (!isAuthorized(request)) return fail("Akses ditolak.", 401);

  const now = new Date();
  const renewalReminders = await sendRenewalReminders(now);
  const ga4 = await syncGa4Stats(now);
  const invoicesOverdue = await markOverdueInvoices(now);

  return ok({ ranAt: now.toISOString(), renewalReminders, ga4, invoicesOverdue });
}
