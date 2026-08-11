import { QuoteRepository } from "../../../domain/repositories/quote-repository";
import { QuoteResponse } from "../../dtos/quote-dto";
import { AppError } from "../../../presentation/middlewares/error-handler";

/**
 * Get Quote Use Case
 *
 * Retrieves a single quote by its unique identifier.
 */
export class GetQuoteUseCase {
  constructor(private readonly quoteRepository: QuoteRepository) {}

  async execute(id: string): Promise<QuoteResponse> {
    const quote = await this.quoteRepository.findById(id);

    if (!quote) {
      throw new AppError(404, "Quote not found");
    }

    return {
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
    };
  }
}