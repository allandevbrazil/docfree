import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { Quote } from "../types/quote";

/**
 * Quote PDF Document
 *
 * Renders a professional budget/orçamento layout using @react-pdf/renderer.
 * Used by the PDF download service to generate and save the file.
 */

const STATUS_LABELS: Record<string, string> = {
  APPROVED: "Aprovado",
  PENDING: "Pendente",
  REJECTED: "Rejeitado",
};

const DISCOUNT_LABELS: Record<string, string> = {
  FIXED: "Valor Fixo",
  PERCENTAGE: "Percentual",
};

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR");
}

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1a1a1a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 2,
    borderBottomColor: "#2563eb",
    paddingBottom: 16,
    marginBottom: 20,
  },
  brand: {
    flexDirection: "column",
    gap: 2,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2563eb",
  },
  brandSubtitle: {
    fontSize: 9,
    color: "#6b7280",
  },
  docTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1a1a1a",
    textAlign: "right",
  },
  docMeta: {
    fontSize: 9,
    color: "#6b7280",
    textAlign: "right",
    marginTop: 4,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#2563eb",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  infoGrid: {
    flexDirection: "row",
    gap: 16,
  },
  infoCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
    padding: 10,
  },
  infoLabel: {
    fontSize: 8,
    color: "#6b7280",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  infoSub: {
    fontSize: 9,
    color: "#4b5563",
    marginTop: 2,
  },
  table: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#374151",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableCell: {
    fontSize: 9,
    color: "#1a1a1a",
  },
  colDesc: { flex: 4 },
  colQty: { flex: 1, textAlign: "right" },
  colUnit: { flex: 2, textAlign: "right" },
  colTotal: { flex: 2, textAlign: "right" },
  summary: {
    marginTop: 12,
    alignSelf: "flex-end",
    width: 240,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  summaryLabel: {
    fontSize: 9,
    color: "#6b7280",
  },
  summaryValue: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  summaryDivider: {
    borderTopWidth: 1,
    borderTopColor: "#d1d5db",
    marginVertical: 4,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  totalValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2563eb",
  },
  terms: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
    padding: 10,
    backgroundColor: "#f9fafb",
  },
  termsTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#374151",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  termsText: {
    fontSize: 9,
    color: "#4b5563",
    lineHeight: 1.4,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 32,
    right: 32,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 8,
    color: "#9ca3af",
  },
});

interface QuotePdfDocumentProps {
  quote: Quote;
}

export function QuotePdfDocument({ quote }: QuotePdfDocumentProps) {
  const discountValue =
    quote.discountType === "PERCENTAGE"
      ? (quote.subtotal * quote.discount) / 100
      : quote.discount;

  return (
    <Document
      title={`Orçamento - ${quote.projectName}`}
      author="DocPrático"
      subject={`Orçamento ${quote.projectName} - ${quote.clientName}`}
    >
      <Page size="A4" style={styles.page}>
        {/* ===== Header ===== */}
        <View style={styles.header}>
          <View style={styles.brand}>
            <Text style={styles.brandTitle}>DocPrático</Text>
            <Text style={styles.brandSubtitle}>
              Orçamentos profissionais para seu negócio
            </Text>
          </View>
          <View>
            <Text style={styles.docTitle}>ORÇAMENTO</Text>
            <Text style={styles.docMeta}>Nº {quote.id.slice(0, 8).toUpperCase()}</Text>
            <Text style={styles.docMeta}>Emitido em {formatDate(quote.createdAt)}</Text>
          </View>
        </View>

        {/* ===== Client & Project Info ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados do Orçamento</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Cliente</Text>
              <Text style={styles.infoValue}>{quote.clientName}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Projeto</Text>
              <Text style={styles.infoValue}>{quote.projectName}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Status</Text>
              <Text style={styles.infoValue}>
                {STATUS_LABELS[quote.status] ?? quote.status}
              </Text>
            </View>
          </View>
        </View>

        {/* ===== Items Table ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Itens do Orçamento</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.colDesc]}>Descrição</Text>
              <Text style={[styles.tableHeaderCell, styles.colQty]}>Qtd</Text>
              <Text style={[styles.tableHeaderCell, styles.colUnit]}>Preço Unit.</Text>
              <Text style={[styles.tableHeaderCell, styles.colTotal]}>Total</Text>
            </View>
            {quote.items.map((item) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.colDesc]}>{item.description}</Text>
                <Text style={[styles.tableCell, styles.colQty]}>{item.quantity}</Text>
                <Text style={[styles.tableCell, styles.colUnit]}>
                  {formatBRL(item.unitPrice)}
                </Text>
                <Text style={[styles.tableCell, styles.colTotal]}>
                  {formatBRL(item.totalPrice)}
                </Text>
              </View>
            ))}
          </View>

          {/* ===== Financial Summary ===== */}
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatBRL(quote.subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Desconto ({DISCOUNT_LABELS[quote.discountType] ?? quote.discountType})
              </Text>
              <Text style={styles.summaryValue}>
                {quote.discount > 0
                  ? `- ${formatBRL(discountValue)}`
                  : formatBRL(0)}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatBRL(quote.totalValue)}</Text>
            </View>
          </View>
        </View>

        {/* ===== Terms & Conditions ===== */}
        {quote.termsAndConditions ? (
          <View style={styles.terms}>
            <Text style={styles.termsTitle}>Termos e Condições</Text>
            <Text style={styles.termsText}>{quote.termsAndConditions}</Text>
          </View>
        ) : null}

        {/* ===== Footer ===== */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            DocPrático • Orçamento gerado em {formatDate(new Date().toISOString())}
          </Text>
          <Text style={styles.footerText}>Obrigado pela preferência!</Text>
        </View>
      </Page>
    </Document>
  );
}