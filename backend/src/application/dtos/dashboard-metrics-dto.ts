/**
 * Dashboard Metrics DTO
 *
 * Data Transfer Objects that shape the response exactly how
 * the front-end expects it for the Dashboard screen (BFF pattern).
 */

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