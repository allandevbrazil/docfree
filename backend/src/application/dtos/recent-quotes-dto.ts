import { QuoteStatus } from "../../domain/entities/quote";

/**
 * Recent Quotes DTO
 *
 * Shapes the paginated list of recent quotes exactly how
 * the front-end table expects it (BFF pattern).
 */

export interface RecentQuotesDTO {
  data: RecentQuoteItemDTO[];
  pagination: RecentQuotesPaginationDTO;
}

export interface RecentQuoteItemDTO {
  id: string;
  /** ISO date string formatted as DD/MM/YYYY for display */
  createdAt: string;
  /** Client name */
  clientName: string;
  /** Project name */
  projectName: string;
  /** Total value as number */
  totalValue: number;
  /** Formatted value like "R$ 4.500,00" ready for display */
  formattedValue: string;
  /** Status: APPROVED | PENDING | REJECTED */
  status: QuoteStatus;
}

export interface RecentQuotesPaginationDTO {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  /** Message like "Mostrando 4 de 24 registros" */
  summary: string;
}