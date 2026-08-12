import { Request, Response } from "express";
import { CreateQuoteUseCase } from "../../application/use-cases/quotes/create-quote-use-case";
import { GetQuoteUseCase } from "../../application/use-cases/quotes/get-quote-use-case";
import { ListQuotesUseCase } from "../../application/use-cases/quotes/list-quotes-use-case";
import { UpdateQuoteUseCase } from "../../application/use-cases/quotes/update-quote-use-case";
import { DeleteQuoteUseCase } from "../../application/use-cases/quotes/delete-quote-use-case";
import { QuoteStatus } from "../../domain/entities/quote";
import {
  CreateQuoteInput,
  UpdateQuoteInput,
} from "../../application/dtos/quote-dto";
import { assertUuid, parseOptionalIsoDate } from "../middlewares/request-validation";

/**
 * Quote Controller
 *
 * Handles HTTP requests for quote operations.
 * Controllers are thin: they parse the request, call the use case,
 * and format the response. No business logic lives here.
 */
export class QuoteController {
  constructor(
    private readonly createQuoteUseCase: CreateQuoteUseCase,
    private readonly getQuoteUseCase: GetQuoteUseCase,
    private readonly listQuotesUseCase: ListQuotesUseCase,
    private readonly updateQuoteUseCase: UpdateQuoteUseCase,
    private readonly deleteQuoteUseCase: DeleteQuoteUseCase
  ) {}

  /**
   * POST /api/quotes
   * Creates a new quote.
   */
  async create(req: Request, res: Response): Promise<void> {
    const dto: CreateQuoteInput = {
      ...req.body,
      sentAt: parseOptionalIsoDate(req.body.sentAt)?.toISOString(),
    };

    const quote = await this.createQuoteUseCase.execute(dto);

    res.status(201).json({
      success: true,
      data: quote,
    });
  }

  /**
   * GET /api/quotes/:id
   * Returns a single quote by id.
   */
  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    assertUuid(id, "id");

    const quote = await this.getQuoteUseCase.execute(id);

    if (!quote) {
      res.status(404).json({
        success: false,
        message: "Quote not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: quote,
    });
  }

  /**
   * GET /api/quotes
   * Returns a paginated list of quotes with optional filters.
   */
  async list(req: Request, res: Response): Promise<void> {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(req.query.pageSize as string, 10) || 10)
    );

    const status = this.parseStatus(req.query.status as string | undefined);
    const search = req.query.search as string | undefined;
    const clientName = req.query.clientName as string | undefined;
    const projectName = req.query.projectName as string | undefined;

    const result = await this.listQuotesUseCase.execute({
      page,
      pageSize,
      status,
      search,
      clientName,
      projectName,
    });

    res.status(200).json({
      success: true,
      data: result.data,
      meta: {
        total: result.pagination.total,
        page: result.pagination.page,
        pageSize: result.pagination.pageSize,
        totalPages: result.pagination.totalPages,
        summary: result.pagination.summary,
      },
    });
  }

  /**
   * PUT /api/quotes/:id
   * Updates an existing quote.
   */
  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    assertUuid(id, "id");
    const dto: UpdateQuoteInput = {
      ...req.body,
      sentAt: parseOptionalIsoDate(req.body.sentAt)?.toISOString(),
    };

    const quote = await this.updateQuoteUseCase.execute(id, dto);

    if (!quote) {
      res.status(404).json({
        success: false,
        message: "Quote not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: quote,
    });
  }

  /**
   * DELETE /api/quotes/:id
   * Deletes a quote.
   */
  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    assertUuid(id, "id");

    const deleted = await this.deleteQuoteUseCase.execute(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: "Quote not found",
      });
      return;
    }

    res.status(204).send();
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  private parseStatus(value: string | undefined): QuoteStatus | undefined {
    if (!value) {
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
}