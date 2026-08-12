import { QuoteRepository } from "../../../domain/repositories/quote-repository";
import { ListQuotesParams, ListQuotesResult } from "../../dtos/quote-dto";
import { QuoteStatus } from "../../../domain/entities/quote";

/**
 * List Quotes Use Case
 *
 * Retrieves a paginated list of quotes with optional filters.
 * Formats the response exactly as the front-end needs.
 */
export class ListQuotesUseCase {
  constructor(private readonly quoteRepository: QuoteRepository) {}

  async execute(params: ListQuotesParams): Promise<ListQuotesResult> {
    const page = Math.max(1, params.page);
    const pageSize = Math.min(100, Math.max(1, params.pageSize));

    const result = await this.quoteRepository.findRecent({
      page,
      pageSize,
      status: params.status,
      search: params.search,
      clientName: params.clientName,
      projectName: params.projectName,
    });

    return {
      data: result.data.map((quote) => ({
        id: quote.id,
        clientId: quote.clientId,
        clientName: quote.clientName,
        projectName: quote.projectName,
        subtotal: quote.subtotal,
        discount: quote.discount,
        discountType: quote.discountType,
        totalValue: quote.totalValue,
        status: quote.status,
        termsAndConditions: quote.termsAndConditions,
        publicLink: quote.publicLink,
        sentAt: quote.sentAt.toISOString(),
        createdAt: quote.createdAt.toISOString(),
        updatedAt: quote.updatedAt.toISOString(),
        items: quote.items.map((item) => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        })),
      })),
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages,
        summary: `Mostrando ${result.data.length} de ${result.total} registros`,
      },
    };
  }
}