import { ClientRepository } from "../../../domain/repositories/client-repository";
import { ClientResponse } from "../../dtos/client-dto";

/**
 * Get Client Use Case
 *
 * Retrieves a single client by its unique identifier.
 */
export class GetClientUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute(id: string): Promise<ClientResponse> {
    const client = await this.clientRepository.findById(id);

    if (!client) {
      throw new Error("Client not found");
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