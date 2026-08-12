import { Quote, QuoteStatus, QuoteItem, DiscountType } from "../entities/quote";

/**
 * Quote enriched with client name for list views.
 */
export interface QuoteWithClient extends Quote {
  clientName: string;
}

/**
 * Quote Repository Interface
 *
 * Defines the contract for quote data access.
 * The infrastructure layer implements this interface.
 * This keeps the domain layer decoupled from any ORM/framework.
 */
export interface QuoteRepository {
  /**
   * Find quotes with pagination and optional filters.
   */
  findRecent(params: FindRecentQuotesParams): Promise<FindRecentQuotesResult>;

  /**
   * Find a single quote by its unique identifier.
   */
  findById(id: string): Promise<QuoteWithClient | null>;

  /**
   * Create a new quote with its items.
   */
  create(data: CreateQuoteData): Promise<QuoteWithClient>;

  /**
   * Update an existing quote and its items.
   */
  update(id: string, data: UpdateQuoteData): Promise<QuoteWithClient | null>;

  /**
   * Delete a quote by its unique identifier.
   */
  delete(id: string): Promise<boolean>;

  /**
   * Get the total value of approved quotes within a date range.
   */
  getApprovedTotalInRange(startDate: Date, endDate: Date): Promise<number>;

  /**
   * Count quotes with a given status within a date range.
   */
  countByStatusInRange(
    status: QuoteStatus,
    startDate: Date,
    endDate: Date
  ): Promise<number>;

  /**
   * Count all quotes within a date range.
   */
  countAllInRange(startDate: Date, endDate: Date): Promise<number>;
}

export interface QuoteItemData {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateQuoteData {
  clientId: string;
  projectName: string;
  subtotal: number;
  discount: number;
  discountType: DiscountType;
  totalValue: number;
  status: QuoteStatus;
  termsAndConditions?: string | null;
  publicLink?: string | null;
  sentAt: Date;
  items: QuoteItemData[];
}

export interface UpdateQuoteData {
  clientId?: string;
  projectName?: string;
  subtotal?: number;
  discount?: number;
  discountType?: DiscountType;
  totalValue?: number;
  status?: QuoteStatus;
  termsAndConditions?: string | null;
  publicLink?: string | null;
  sentAt?: Date;
  items?: QuoteItemData[];
}

export interface FindRecentQuotesParams {
  page: number;
  pageSize: number;
  status?: QuoteStatus;
  search?: string;
  clientName?: string;
  projectName?: string;
}

export interface FindRecentQuotesResult {
  data: QuoteWithClient[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}