/**
 * Quote DTOs
 *
 * Data Transfer Objects for the Quote feature.
 * These define the contract between the presentation layer
 * and the application layer (use cases).
 */

import { QuoteStatus, DiscountType } from "../../domain/entities/quote";

export interface QuoteItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateQuoteInput {
  clientId: string;
  projectName: string;
  items: QuoteItemInput[];
  discount?: number;
  discountType?: DiscountType;
  termsAndConditions?: string;
  status?: QuoteStatus;
  sentAt?: string;
}

export interface UpdateQuoteInput {
  clientId?: string;
  projectName?: string;
  items?: QuoteItemInput[];
  discount?: number;
  discountType?: DiscountType;
  termsAndConditions?: string;
  status?: QuoteStatus;
  sentAt?: string;
}

export interface QuoteItemResponse {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface QuoteResponse {
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
  items: QuoteItemResponse[];
}

export interface ListQuotesParams {
  page: number;
  pageSize: number;
  status?: QuoteStatus;
  search?: string;
  clientName?: string;
  projectName?: string;
}

export interface ListQuotesResult {
  data: QuoteResponse[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    summary: string;
  };
}