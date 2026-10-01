import { Image as PdfImage, Text, View } from "@react-pdf/renderer";
import { PDF_LOGO } from "@/lib/pdf/logo";
import { pdfColors } from "@/lib/pdf/theme";

type PdfHeaderProps = {
  title: string;
  subtitle?: string;
};

export function PdfHeader({ title, subtitle }: PdfHeaderProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        paddingBottom: 14,
        marginBottom: 18,
        borderBottomWidth: 2,
        borderBottomColor: pdfColors.primary,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <PdfImage src={PDF_LOGO} style={{ width: 26, height: 26, borderRadius: 6, marginRight: 8 }} />
        <View>
          <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 14 }}>Boowat</Text>
          <Text style={{ color: pdfColors.muted, fontSize: 9 }}>boowat.com</Text>
        </View>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 16, color: pdfColors.primary }}>{title}</Text>
        {subtitle && <Text style={{ color: pdfColors.muted, marginTop: 2 }}>{subtitle}</Text>}
      </View>
    </View>
  );
}

const footerText = { position: "absolute", bottom: 24, fontSize: 8, color: pdfColors.muted } as const;

export function PdfFooter() {
  return (
    <>
      <Text fixed style={{ ...footerText, left: 40 }}>
        Boowat.com
      </Text>
      <Text
        fixed
        style={{ ...footerText, left: 40, right: 40, textAlign: "right" }}
        render={({ pageNumber, totalPages }) => `Halaman ${pageNumber} dari ${totalPages}`}
      />
    </>
  );
}
