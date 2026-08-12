import { pdf } from "@react-pdf/renderer";
import type { Quote } from "../types/quote";
import { QuotePdfDocument } from "../components/QuotePdfDocument";

export async function downloadQuotePdf(quote: Quote): Promise<void> {
  const blob = await pdf(<QuotePdfDocument quote={quote} />).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const slug = quote.projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  link.download = `orcamento-${slug || "orcamento"}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}