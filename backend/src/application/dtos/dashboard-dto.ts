import { DashboardMetricsDTO } from "./dashboard-metrics-dto";
import { RecentQuotesDTO } from "./recent-quotes-dto";

/**
 * Consolidated Dashboard DTO
 *
 * Single response payload for the Dashboard screen (BFF pattern).
 * Combines the "Visão Geral" (KPIs) and "Histórico Recente" sections
 * so the front-end can render the entire screen with one request.
 */
export interface DashboardDTO {
  /** "Visão Geral" section — KPI cards */
  overview: DashboardMetricsDTO;
  /** "Histórico Recente" section — paginated table data */
  recentQuotes: RecentQuotesDTO;
}