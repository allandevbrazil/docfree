import { ClientRepository } from "../../../domain/repositories/client-repository";
import { AppError } from "../../../presentation/middlewares/error-handler";

/**
 * Delete Client Use Case
 *
 * Deletes a client by its unique identifier.
 * Returns true if the client was deleted, false otherwise.
 */
export class DeleteClientUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute(id: string): Promise<{ deleted: boolean }> {
    const deleted = await this.clientRepository.delete(id);

    if (!deleted) {
      throw new AppError(404, "Client not found");
    }

    return { deleted: true };
  }
}