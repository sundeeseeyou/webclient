import type { DocumentProps } from "@react-pdf/renderer";
import { NextResponse, type NextRequest } from "next/server";
import { createElement, type ReactElement } from "react";
import { notFound, validationError } from "@/lib/api";
import { getMonthlyReport, reportFilename } from "@/lib/monthly-report";
import { MonthlyReportDocument } from "@/lib/pdf/monthly-report-pdf";
import { pdfResponse } from "@/lib/pdf/response";
import { clientScope, requireApiUser } from "@/lib/rbac";
import { monthlyReportQuerySchema } from "@/lib/validations/report";

export async function GET(request: NextRequest) {
  const user = await requireApiUser();
  if (user instanceof NextResponse) return user;

  const params = request.nextUrl.searchParams;
  const query = monthlyReportQuerySchema.safeParse({
    websiteId: params.get("websiteId") ?? "",
    month: params.get("month") ?? "",
  });
  if (!query.success) return validationError(query.error);

  const { websiteId, month } = query.data;
  // Website milik klien lain dianggap tidak ada (404), bukan 403.
  const report = await getMonthlyReport({ id: websiteId, ...clientScope(user) }, month);
  if (!report) return notFound();

  // Tipe renderToBuffer hanya menerima elemen <Document>; MonthlyReportDocument memang merender <Document> sebagai akarnya.
  const document = createElement(MonthlyReportDocument, { report, generatedAt: new Date() }) as ReactElement<DocumentProps>;
  return pdfResponse(document, reportFilename(report.website.domain, month));
}
