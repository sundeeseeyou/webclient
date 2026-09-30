import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import type { ReactElement } from "react";

// Nama file tidak boleh memuat "/" (nomor invoice memakai garis miring).
function safeFilename(name: string): string {
  return name.replace(/[\\/:*?"<>|]+/g, "-");
}

export async function pdfResponse(document: ReactElement<DocumentProps>, filename: string): Promise<Response> {
  const buffer = await renderToBuffer(document);
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeFilename(filename)}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
