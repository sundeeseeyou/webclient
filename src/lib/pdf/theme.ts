import { StyleSheet } from "@react-pdf/renderer";

// Font bawaan PDF (Helvetica) dipakai agar tidak perlu menyertakan file font; hurufnya cukup untuk Bahasa Indonesia.
// Jangan pasang lineHeight di gaya halaman: react-pdf salah menghitung posisi teks dinamis (nomor halaman) sehingga keluar dari kertas.
export const pdfColors = {
  primary: "#301193",
  secondary: "#b5e41b",
  text: "#030303",
  muted: "#5b6169",
  border: "#e5e7eb",
  surface: "#f6f7f8",
  success: "#147a35",
  danger: "#c0381a",
};

export const pdfStyles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 56,
    paddingHorizontal: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: pdfColors.text,
  },
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    marginTop: 18,
    marginBottom: 6,
  },
  muted: {
    color: pdfColors.muted,
  },
  row: {
    flexDirection: "row",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: pdfColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: pdfColors.border,
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: pdfColors.muted,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: pdfColors.border,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
});
