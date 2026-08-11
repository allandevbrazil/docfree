/**
 * Types matching the backend BFF response for the Dashboard screen.
 * See: backend/src/application/dtos/dashboard-dto.ts
 */

export type QuoteStatus = "APPROVED" | "PENDING" | "REJECTED";

export interface DashboardDTO {
  overview: DashboardMetricsDTO;
  recentQuotes: RecentQuotesDTO;
}

export interface DashboardMetricsDTO {
  approvedQuotes: ApprovedQuotesKpiDTO;
  awaitingResponse: AwaitingResponseKpiDTO;
  conversionRate: ConversionRateKpiDTO;
}

export interface ApprovedQuotesKpiDTO {
  /** Total monetary value of approved quotes in the current month */
  totalValue: number;
  /** Formatted value like "R$ 12.450,00" ready for display */
  formattedValue: string;
  /** Percentage growth/shrink vs previous month (e.g. 12 means +12%) */
  percentageChange: number;
  /** True if percentageChange is >= 0 */
  isPositiveChange: boolean;
}

export interface AwaitingResponseKpiDTO {
  /** Number of pending quotes sent in the current week */
  count: number;
}

export interface ConversionRateKpiDTO {
  /** Conversion percentage (0-100) */
  rate: number;
  /** Formatted rate like "68%" ready for display */
  formattedRate: string;
  /** Percentage point variation vs previous month (e.g. 4 means +4pp) */
  variation: number;
  /** True if variation is >= 0 */
  isPositiveVariation: boolean;
}

export interface RecentQuotesDTO {
  data: RecentQuoteItemDTO[];
  pagination: RecentQuotesPaginationDTO;
}

export interface RecentQuoteItemDTO {
  id: string;
  /** Date formatted as DD/MM/YYYY for display */
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

/** Query params for GET /api/dashboard */
export interface DashboardParams {
  page?: number;
  pageSize?: number;
  status?: QuoteStatus;
  clientName?: string;
}