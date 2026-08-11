import { QuoteRepository } from "../../domain/repositories/quote-repository";
import { QuoteStatus } from "../../domain/entities/quote";
import {
  DashboardMetricsDTO,
  ApprovedQuotesKpiDTO,
  AwaitingResponseKpiDTO,
  ConversionRateKpiDTO,
} from "../dtos/dashboard-metrics-dto";

/**
 * Get Dashboard Metrics Use Case
 *
 * Orchestrates the calculation of all KPI cards for the Dashboard screen.
 * Follows the BFF pattern by returning data already formatted for display.
 */
export class GetDashboardMetricsUseCase {
  constructor(private readonly quoteRepository: QuoteRepository) {}

  async execute(): Promise<DashboardMetricsDTO> {
    const now = new Date();

    // --- Date ranges for current month ---
    const currentMonthStart = this.getStartOfMonth(now);
    const currentMonthEnd = now;

    // --- Date ranges for previous month ---
    const previousMonthStart = this.getStartOfPreviousMonth(now);
    const previousMonthEnd = this.getEndOfPreviousMonth(now);

    // --- Date range for current week (Monday to now) ---
    const currentWeekStart = this.getStartOfCurrentWeek(now);

    // --- KPI 1: Approved Quotes ---
    const [currentMonthApprovedTotal, previousMonthApprovedTotal] =
      await Promise.all([
        this.quoteRepository.getApprovedTotalInRange(
          currentMonthStart,
          currentMonthEnd
        ),
        this.quoteRepository.getApprovedTotalInRange(
          previousMonthStart,
          previousMonthEnd
        ),
      ]);

    const approvedQuotes = this.buildApprovedQuotesKpi(
      currentMonthApprovedTotal,
      previousMonthApprovedTotal
    );

    // --- KPI 2: Awaiting Response (pending quotes sent this week) ---
    const awaitingResponseCount =
      await this.quoteRepository.countByStatusInRange(
        QuoteStatus.PENDING,
        currentWeekStart,
        now
      );

    const awaitingResponse: AwaitingResponseKpiDTO = {
      count: awaitingResponseCount,
    };

    // --- KPI 3: Conversion Rate ---
    const [currentMonthTotal, currentMonthApprovedCount, previousMonthTotal, previousMonthApprovedCount] =
      await Promise.all([
        this.quoteRepository.countAllInRange(currentMonthStart, currentMonthEnd),
        this.quoteRepository.countByStatusInRange(
          QuoteStatus.APPROVED,
          currentMonthStart,
          currentMonthEnd
        ),
        this.quoteRepository.countAllInRange(
          previousMonthStart,
          previousMonthEnd
        ),
        this.quoteRepository.countByStatusInRange(
          QuoteStatus.APPROVED,
          previousMonthStart,
          previousMonthEnd
        ),
      ]);

    const conversionRate = this.buildConversionRateKpi(
      currentMonthApprovedCount,
      currentMonthTotal,
      previousMonthApprovedCount,
      previousMonthTotal
    );

    return {
      approvedQuotes,
      awaitingResponse,
      conversionRate,
    };
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  private buildApprovedQuotesKpi(
    currentTotal: number,
    previousTotal: number
  ): ApprovedQuotesKpiDTO {
    const percentageChange = this.calculatePercentageChange(
      currentTotal,
      previousTotal
    );

    return {
      totalValue: currentTotal,
      formattedValue: this.formatCurrency(currentTotal),
      percentageChange,
      isPositiveChange: percentageChange >= 0,
    };
  }

  private buildConversionRateKpi(
    currentApproved: number,
    currentTotal: number,
    previousApproved: number,
    previousTotal: number
  ): ConversionRateKpiDTO {
    const currentRate = this.calculateRate(currentApproved, currentTotal);
    const previousRate = this.calculateRate(previousApproved, previousTotal);
    const variation = this.roundToInteger(currentRate - previousRate);

    return {
      rate: currentRate,
      formattedRate: `${this.roundToInteger(currentRate)}%`,
      variation,
      isPositiveVariation: variation >= 0,
    };
  }

  private calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return this.roundToInteger(((current - previous) / previous) * 100);
  }

  private calculateRate(part: number, total: number): number {
    if (total === 0) {
      return 0;
    }
    return (part / total) * 100;
  }

  private roundToInteger(value: number): number {
    return Math.round(value);
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }

  private getStartOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
  }

  private getStartOfPreviousMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth() - 1, 1, 0, 0, 0, 0);
  }

  private getEndOfPreviousMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 0, 23, 59, 59, 999);
  }

  private getStartOfCurrentWeek(date: Date): Date {
    const day = date.getDay(); // 0 = Sunday
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
    return new Date(date.getFullYear(), date.getMonth(), diff, 0, 0, 0, 0);
  }
}