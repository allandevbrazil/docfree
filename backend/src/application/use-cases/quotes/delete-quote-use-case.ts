import { QuoteRepository } from "../../../domain/repositories/quote-repository";

/**
 * Delete Quote Use Case
 *
 * Orchestrates the deletion of a quote.
 * Follows the Single Responsibility Principle: only handles quote deletion.
 */
export class DeleteQuoteUseCase {
  constructor(private readonly quoteRepository: QuoteRepository) {}

  /**
   * Deletes a quote by its unique identifier.
   *
   * @param id - Quote unique identifier
   * @returns true if the quote was deleted, false if it was not found
   */
  async execute(id: string): Promise<boolean> {
    return this.quoteRepository.delete(id);
  }
}