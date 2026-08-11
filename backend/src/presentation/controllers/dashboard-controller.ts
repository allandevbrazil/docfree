import { Request, Response } from "express";
import { DashboardService } from "../../application/services/dashboard-service";
import { QuoteStatus } from "../../domain/entities/quote";

/**
 * Dashboard Controller
 *
 * Handles HTTP requests for the Dashboard screen.
 * Injects the DashboardService via constructor (dependency injection).
 */
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * GET /dashboard
   * Returns the full Dashboard payload: KPI overview + recent quotes table.
   */
  async getDashboard(req: Request, res: Response): Promise<void> {
    const page = this.parsePositiveInt(req.query.page, 1);
    const pageSize = this.parsePositiveInt(req.query.pageSize, 10);
    const status = this.parseStatus(req.query.status);
    const clientName = this.parseString(req.query.clientName);

    const dashboard = await this.dashboardService.getDashboard({
      page,
      pageSize,
      status,
      clientName,
    });

    res.json(dashboard);
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  private parsePositiveInt(value: unknown, defaultValue: number): number {
    if (typeof value !== "string") {
      return defaultValue;
    }
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed < 1) {
      return defaultValue;
    }
    return parsed;
  }

  private parseStatus(value: unknown): QuoteStatus | undefined {
    if (typeof value !== "string") {
      return undefined;
    }
    const upper = value.toUpperCase();
    if (
      upper === QuoteStatus.APPROVED ||
      upper === QuoteStatus.PENDING ||
      upper === QuoteStatus.REJECTED
    ) {
      return upper as QuoteStatus;
    }
    return undefined;
  }

  private parseString(value: unknown): string | undefined {
    if (typeof value !== "string" || value.trim() === "") {
      return undefined;
    }
    return value.trim();
  }
}