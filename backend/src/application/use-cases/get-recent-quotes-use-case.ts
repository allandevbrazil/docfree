import { QuoteRepository } from "../../domain/repositories/quote-repository";
import { QuoteStatus } from "../../domain/entities/quote";
import {
  RecentQuotesDTO,
  RecentQuoteItemDTO,
} from "../dtos/recent-quotes-dto";

/**
 * Get Recent Quotes Use Case
 *
 * Retrieves a paginated list of recent quotes formatted for the
 * front-end table. Supports future filters via the params object.
 */
export class GetRecentQuotesUseCase {
  constructor(private readonly quoteRepository: QuoteRepository) {}

  async execute(params: GetRecentQuotesParams): Promise<RecentQuotesDTO> {
    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.min(50, Math.max(1, params.pageSize ?? 10));

    const result = await this.quoteRepository.findRecent({
      page,
      pageSize,
      status: params.status,
      clientName: params.clientName,
    });

    const data: RecentQuoteItemDTO[] = result.data.map((quote) => ({
      id: quote.id,
      createdAt: this.formatDate(quote.createdAt),
      clientName: quote.clientName,
      projectName: quote.projectName,
      totalValue: quote.totalValue,
      formattedValue: this.formatCurrency(quote.totalValue),
      status: quote.status,
    }));

    return {
      data,
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages,
        summary: `Mostrando ${result.data.length} de ${result.total} registros`,
      },
    };
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }
}

export interface GetRecentQuotesParams {
  page?: number;
  pageSize?: number;
  status?: QuoteStatus;
  clientName?: string;
}