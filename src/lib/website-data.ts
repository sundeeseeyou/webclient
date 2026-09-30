import type { Prisma } from "@prisma/client";
import type { z } from "zod";
import { fail } from "@/lib/api";
import { parseDateInput } from "@/lib/dates";
import type { articleSchema, WebsiteValues } from "@/lib/validations/website";

const DOMAIN_TAKEN = "Domain sudah terdaftar";

export function domainTakenResponse() {
  return fail(DOMAIN_TAKEN, 409, { domain: DOMAIN_TAKEN });
}

export function toWebsiteData(values: WebsiteValues): Prisma.WebsiteUncheckedCreateInput {
  return {
    ...values,
    hostingRenewAt: values.hostingRenewAt ? parseDateInput(values.hostingRenewAt) : null,
    domainRenewAt: values.domainRenewAt ? parseDateInput(values.domainRenewAt) : null,
  };
}

// Artikel berstatus terbit tanpa tanggal dianggap terbit hari ini, agar tetap terhitung di dashboard klien.
export function toArticleData(values: z.output<typeof articleSchema>) {
  const publishedAt = values.publishedAt ? parseDateInput(values.publishedAt) : null;
  return {
    title: values.title,
    url: values.url,
    status: values.status,
    publishedAt: publishedAt ?? (values.status === "PUBLISHED" ? new Date() : null),
  };
}
