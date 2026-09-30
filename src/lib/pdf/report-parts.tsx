import { Text, View } from "@react-pdf/renderer";
import { pdfColors, pdfStyles } from "@/lib/pdf/theme";

type PdfColumn = { label: string; width: string; align?: "left" | "right" };
export type PdfCell = string | { text: string; color?: string };

type PdfTableProps = {
  columns: PdfColumn[];
  rows: PdfCell[][];
};

export function PdfTable({ columns, rows }: PdfTableProps) {
  const cellStyle = (index: number) => ({
    width: columns[index].width,
    textAlign: columns[index].align ?? "left",
    paddingRight: index < columns.length - 1 ? 8 : 0,
  });

  return (
    <View style={{ borderTopWidth: 1, borderTopColor: pdfColors.border }}>
      <View style={pdfStyles.tableHeader}>
        {columns.map((column, index) => (
          <Text key={column.label} style={cellStyle(index)}>
            {column.label}
          </Text>
        ))}
      </View>
      {rows.map((row, rowIndex) => (
        // Satu baris tidak boleh terpotong ke halaman berikutnya.
        <View key={rowIndex} style={pdfStyles.tableRow} wrap={false}>
          {row.map((cell, index) => {
            const { text, color } = typeof cell === "string" ? { text: cell, color: undefined } : cell;
            return (
              <Text key={index} style={{ ...cellStyle(index), color }}>
                {text}
              </Text>
            );
          })}
        </View>
      ))}
    </View>
  );
}

type PdfSectionProps = {
  title: string;
  note?: string;
  children: React.ReactNode;
};

export function PdfSection({ title, note, children }: PdfSectionProps) {
  return (
    <View>
      {/* Judul bagian tidak boleh tertinggal sendirian di bawah halaman tanpa isinya. */}
      <Text style={pdfStyles.sectionTitle} minPresenceAhead={48}>
        {title}
      </Text>
      {note && <Text style={{ ...pdfStyles.muted, fontSize: 9, marginBottom: 6 }}>{note}</Text>}
      {children}
    </View>
  );
}

export function PdfEmpty({ children }: { children: string }) {
  return (
    <Text
      style={{
        ...pdfStyles.muted,
        borderWidth: 1,
        borderColor: pdfColors.border,
        borderRadius: 4,
        paddingVertical: 8,
        paddingHorizontal: 8,
      }}
    >
      {children}
    </Text>
  );
}

type InfoItem = { label: string; value: string };

export function PdfInfoGrid({ items }: { items: InfoItem[] }) {
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        backgroundColor: pdfColors.surface,
        borderRadius: 6,
        paddingTop: 10,
        paddingHorizontal: 12,
      }}
    >
      {items.map((item) => (
        <View key={item.label} style={{ width: "50%", paddingRight: 12, marginBottom: 10 }}>
          <Text style={{ ...pdfStyles.muted, fontSize: 8 }}>{item.label}</Text>
          <Text style={{ fontFamily: "Helvetica-Bold", marginTop: 2 }}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
}
