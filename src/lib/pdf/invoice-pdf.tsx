import type { InvoiceStatus } from "@prisma/client";
import { Document, type DocumentProps, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { formatDate, formatRupiah } from "@/lib/format";
import type { InvoiceDetail } from "@/lib/invoice-queries";
import { invoiceStatusLabels } from "@/lib/labels";
import { PdfFooter, PdfHeader } from "@/lib/pdf/layout";
import { pdfColors, pdfStyles } from "@/lib/pdf/theme";

const styles = StyleSheet.create({
  label: { fontSize: 8, color: pdfColors.muted, marginBottom: 3 },
  strong: { fontFamily: "Helvetica-Bold" },
  party: { flex: 1, paddingRight: 16 },
  line: { marginTop: 2 },
  meta: { width: 170 },
  metaRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  project: {
    flexDirection: "row",
    marginTop: 18,
    padding: 10,
    backgroundColor: pdfColors.surface,
    borderRadius: 4,
  },
  descriptionCell: { flex: 1, paddingRight: 8 },
  qtyCell: { width: 44, textAlign: "right" },
  moneyCell: { width: 100, textAlign: "right" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 2,
    borderBottomColor: pdfColors.primary,
  },
});

const statusColors: Partial<Record<InvoiceStatus, string>> = {
  PAID: pdfColors.success,
  OVERDUE: pdfColors.danger,
};

function statusText(invoice: InvoiceDetail): string {
  if (invoice.status === "PAID" && invoice.paidAt) return `Lunas (${formatDate(invoice.paidAt)})`;
  return invoiceStatusLabels[invoice.status];
}

function MetaRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.metaRow}>
      <Text style={pdfStyles.muted}>{label}</Text>
      <Text style={{ ...styles.strong, color: color ?? pdfColors.text }}>{value}</Text>
    </View>
  );
}

// Props Document ikut diterima supaya createElement(InvoiceDocument) bertipe ReactElement<DocumentProps> yang diminta renderToBuffer.
type InvoiceDocumentProps = DocumentProps & { invoice: InvoiceDetail };

export function InvoiceDocument({ invoice, ...documentProps }: InvoiceDocumentProps) {
  const { client, website } = invoice.project;

  return (
    <Document title={`Invoice ${invoice.number}`} author="Boowat.com" language="id" {...documentProps}>
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader title="INVOICE" subtitle={invoice.number} />

        <View style={pdfStyles.row}>
          <View style={styles.party}>
            <Text style={styles.label}>DITAGIHKAN OLEH</Text>
            <Text style={styles.strong}>Boowat.com</Text>
            <Text style={[styles.line, pdfStyles.muted]}>boowat.com</Text>
          </View>
          <View style={styles.party}>
            <Text style={styles.label}>DITAGIHKAN KEPADA</Text>
            <Text style={styles.strong}>{client.company}</Text>
            <Text style={styles.line}>{client.name}</Text>
            <Text style={styles.line}>{client.email}</Text>
            {client.phone && <Text style={styles.line}>{client.phone}</Text>}
            {client.address && <Text style={[styles.line, pdfStyles.muted]}>{client.address}</Text>}
          </View>
          <View style={styles.meta}>
            <MetaRow label="Tanggal terbit" value={formatDate(invoice.issuedDate)} />
            <MetaRow label="Jatuh tempo" value={formatDate(invoice.dueDate)} />
            <MetaRow label="Status" value={statusText(invoice)} color={statusColors[invoice.status]} />
          </View>
        </View>

        <View style={styles.project}>
          <View style={styles.party}>
            <Text style={styles.label}>PROYEK</Text>
            <Text>{invoice.project.name}</Text>
          </View>
          <View style={styles.party}>
            <Text style={styles.label}>WEBSITE</Text>
            <Text>{website?.domain ?? "-"}</Text>
          </View>
        </View>

        <Text style={pdfStyles.sectionTitle}>Rincian tagihan</Text>
        <View style={pdfStyles.tableHeader}>
          <Text style={styles.descriptionCell}>Deskripsi</Text>
          <Text style={styles.qtyCell}>Jumlah</Text>
          <Text style={styles.moneyCell}>Harga satuan</Text>
          <Text style={styles.moneyCell}>Subtotal</Text>
        </View>
        {invoice.items.map((item) => (
          <View key={item.id} style={pdfStyles.tableRow} wrap={false}>
            <Text style={styles.descriptionCell}>{item.description}</Text>
            <Text style={styles.qtyCell}>{item.qty}</Text>
            <Text style={styles.moneyCell}>{formatRupiah(item.unitPrice)}</Text>
            <Text style={styles.moneyCell}>{formatRupiah(item.unitPrice * item.qty)}</Text>
          </View>
        ))}
        <View style={styles.totalRow} wrap={false}>
          <Text style={[styles.strong, { marginRight: 24 }]}>Total</Text>
          <Text style={[styles.strong, styles.moneyCell, { fontSize: 12, color: pdfColors.primary }]}>
            {formatRupiah(invoice.amount)}
          </Text>
        </View>

        {invoice.notes && (
          <View>
            <Text style={pdfStyles.sectionTitle} minPresenceAhead={24}>
              Catatan
            </Text>
            <Text>{invoice.notes}</Text>
          </View>
        )}

        <PdfFooter />
      </Page>
    </Document>
  );
}
