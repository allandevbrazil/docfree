/**
 * Types matching the backend Quote DTOs.
 * See: backend/src/application/dtos/quote-dto.ts
 */

export type QuoteStatus = "APPROVED" | "PENDING" | "REJECTED";
export type DiscountType = "FIXED" | "PERCENTAGE";

export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Quote {
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
  sentAt: string;
  createdAt: string;
  updatedAt: string;
  items: QuoteItem[];
}

export interface QuoteItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface QuoteInput {
  clientId: string;
  projectName: string;
  items: QuoteItemInput[];
  discount?: number;
  discountType?: DiscountType;
  termsAndConditions?: string;
  status?: QuoteStatus;
  sentAt?: string;
}

export interface QuoteListParams {
  page?: number;
  pageSize?: number;
  status?: QuoteStatus;
  search?: string;
  clientName?: string;
  projectName?: string;
}

export interface QuoteListResult {
  data: Quote[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    summary: string;
  };
}