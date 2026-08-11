import { GetDashboardMetricsUseCase } from "../use-cases/get-dashboard-metrics-use-case";
import { GetRecentQuotesUseCase } from "../use-cases/get-recent-quotes-use-case";
import { DashboardDTO } from "../dtos/dashboard-dto";
import { GetRecentQuotesParams } from "../use-cases/get-recent-quotes-use-case";

/**
 * Dashboard Service
 *
 * Orchestrates the Dashboard use cases and consolidates the response
 * into a single payload (BFF pattern). This allows the front-end to
 * render the entire Dashboard screen with one request.
 */
export class DashboardService {
  constructor(
    private readonly getDashboardMetricsUseCase: GetDashboardMetricsUseCase,
    private readonly getRecentQuotesUseCase: GetRecentQuotesUseCase
  ) {}

  /**
   * Returns the full Dashboard payload: KPI overview + recent quotes table.
   */
  async getDashboard(params: GetRecentQuotesParams): Promise<DashboardDTO> {
    const [overview, recentQuotes] = await Promise.all([
      this.getDashboardMetricsUseCase.execute(),
      this.getRecentQuotesUseCase.execute(params),
    ]);

    return {
      overview,
      recentQuotes,
    };
  }
}