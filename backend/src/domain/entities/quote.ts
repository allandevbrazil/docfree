/**
 * Quote Entity
 *
 * Represents a budget/orçamento in the DocPrático system.
 * This is a pure domain entity with no framework dependencies.
 */

export enum QuoteStatus {
  APPROVED = "APPROVED",
  PENDING = "PENDING",
  REJECTED = "REJECTED",
}

export enum DiscountType {
  FIXED = "FIXED",
  PERCENTAGE = "PERCENTAGE",
}

export interface QuoteItem {
  id: string;
  quoteId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Quote {
  id: string;
  clientId: string;
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
  items: QuoteItem[];
}