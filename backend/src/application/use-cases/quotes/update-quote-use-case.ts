import { QuoteRepository } from "../../../domain/repositories/quote-repository";
import { UpdateQuoteInput, QuoteResponse } from "../../dtos/quote-dto";
import { DiscountType } from "../../../domain/entities/quote";
import { AppError } from "../../../presentation/middlewares/error-handler";

/**
 * Update Quote Use Case
 *
 * Updates an existing quote. Recalculates totals when items
 * or discount values change.
 */
export class UpdateQuoteUseCase {
  constructor(private readonly quoteRepository: QuoteRepository) {}

  async execute(id: string, input: UpdateQuoteInput): Promise<QuoteResponse> {
    const existing = await this.quoteRepository.findById(id);

    if (!existing) {
      throw new AppError(404, "Quote not found");
    }

    if (input.items !== undefined) {
      if (input.items.length === 0) {
        throw new AppError(400, "At least one quote item is required");
      }
      for (const item of input.items) {
        if (!item.description || !item.description.trim()) {
          throw new AppError(400, "Every item must have a description");
        }
        if (item.quantity <= 0) {
          throw new AppError(400, "Every item must have a positive quantity");
        }
        if (item.unitPrice < 0) {
          throw new AppError(
            400,
            "Every item must have a non-negative unit price"
          );
        }
      }
    }

    const items = input.items ?? existing.items;
    const subtotal = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );

    const discountType = input.discountType ?? existing.discountType;
    const discount = input.discount ?? existing.discount;

    if (discount < 0) {
      throw new AppError(400, "Discount cannot be negative");
    }

    const discountValue =
      discountType === DiscountType.PERCENTAGE
        ? (subtotal * discount) / 100
        : discount;

    if (discountValue > subtotal) {
      throw new AppError(400, "Discount cannot exceed the subtotal");
    }

    const totalValue = subtotal - discountValue;

    const quote = await this.quoteRepository.update(id, {
      clientId: input.clientId?.trim(),
      projectName: input.projectName?.trim(),
      subtotal,
      discount,
      discountType,
      totalValue,
      status: input.status,
      termsAndConditions:
        input.termsAndConditions !== undefined
          ? input.termsAndConditions?.trim() ?? null
          : undefined,
      sentAt: input.sentAt ? new Date(input.sentAt) : undefined,
      items: input.items?.map((item) => ({
        description: item.description.trim(),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    });

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