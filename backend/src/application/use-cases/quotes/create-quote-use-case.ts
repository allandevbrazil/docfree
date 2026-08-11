import { QuoteRepository } from "../../../domain/repositories/quote-repository";
import {
  CreateQuoteInput,
  QuoteResponse,
} from "../../dtos/quote-dto";
import { QuoteStatus, DiscountType } from "../../../domain/entities/quote";
import { AppError } from "../../../presentation/middlewares/error-handler";

/**
 * Create Quote Use Case
 *
 * Orchestrates the creation of a new quote.
 * Validates business rules, calculates totals and delegates persistence.
 */
export class CreateQuoteUseCase {
  constructor(private readonly quoteRepository: QuoteRepository) {}

  async execute(input: CreateQuoteInput): Promise<QuoteResponse> {
    if (!input.clientId || !input.clientId.trim()) {
      throw new AppError(400, "Client is required");
    }

    if (!input.projectName || !input.projectName.trim()) {
      throw new AppError(400, "Project name is required");
    }

    if (!input.items || input.items.length === 0) {
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
        throw new AppError(400, "Every item must have a non-negative unit price");
      }
    }

    const subtotal = input.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );

    const discountType = input.discountType ?? DiscountType.FIXED;
    const discount = input.discount ?? 0;

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

    const quote = await this.quoteRepository.create({
      clientId: input.clientId.trim(),
      projectName: input.projectName.trim(),
      subtotal,
      discount,
      discountType,
      totalValue,
      status: input.status ?? QuoteStatus.PENDING,
      termsAndConditions: input.termsAndConditions?.trim() ?? null,
      sentAt: input.sentAt ? new Date(input.sentAt) : new Date(),
      items: input.items.map((item) => ({
        description: item.description.trim(),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    });

    return this.toResponse(quote);
  }

  protected toResponse(quote: {
    id: string;
    clientId: string;
    clientName: string;
    projectName: string;
    subtotal: number;
    discount: number;
    discountType: DiscountType;
    totalValue: number;
    status: QuoteStatus;
    termsAndConditions: string | null;
    publicLink: string | null;
    sentAt: Date;
    createdAt: Date;
    updatedAt: Date;
    items: {
      id: string;
      description: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }[];
  }): QuoteResponse {
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