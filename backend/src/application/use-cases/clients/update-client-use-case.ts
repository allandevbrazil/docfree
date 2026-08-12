import { ClientRepository } from "../../../domain/repositories/client-repository";
import { UpdateClientInput, ClientResponse } from "../../dtos/client-dto";
import { AppError } from "../../../presentation/middlewares/error-handler";

/**
 * Update Client Use Case
 *
 * Updates an existing client with partial data.
 * Validates business rules before persisting changes.
 */
export class UpdateClientUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute(id: string, input: UpdateClientInput): Promise<ClientResponse> {
    const existing = await this.clientRepository.findById(id);

    if (!existing) {
      throw new AppError(404, "Client not found");
    }

    // Business rule: email must be unique if being changed
    if (input.email && input.email.trim().toLowerCase() !== existing.email) {
      const emailInUse = await this.clientRepository.findByEmail(
        input.email.trim().toLowerCase()
      );
      if (emailInUse && emailInUse.id !== id) {
        throw new AppError(409, "A client with this email already exists");
      }
    }

    const client = await this.clientRepository.update(id, {
      name: input.name?.trim() || undefined,
      email: input.email?.trim().toLowerCase() || undefined,
      phone: input.phone?.trim() || undefined,
      company: input.company?.trim() || undefined,
      cep: input.cep?.trim() || undefined,
      street: input.street?.trim() || undefined,
      number: input.number?.trim() || undefined,
      neighborhood: input.neighborhood?.trim() || undefined,
      city: input.city?.trim() || undefined,
      state: input.state?.trim().toUpperCase() || undefined,
      notes: input.notes?.trim() || undefined,
    });

    if (!client) {
      throw new AppError(404, "Client not found");
    }

    return {
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      company: client.company,
      cep: client.cep,
      street: client.street,
      number: client.number,
      neighborhood: client.neighborhood,
      city: client.city,
      state: client.state,
      notes: client.notes,
      createdAt: client.createdAt.toISOString(),
      updatedAt: client.updatedAt.toISOString(),
    };
  }
}