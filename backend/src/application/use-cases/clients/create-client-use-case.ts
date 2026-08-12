import { ClientRepository } from "../../../domain/repositories/client-repository";
import { CreateClientInput, ClientResponse } from "../../dtos/client-dto";
import { AppError } from "../../../presentation/middlewares/error-handler";

/**
 * Create Client Use Case
 *
 * Orchestrates the creation of a new client.
 * Validates business rules and delegates persistence to the repository.
 */
export class CreateClientUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute(input: CreateClientInput): Promise<ClientResponse> {
    // Business rule: email is required and must be unique
    if (!input.email || !input.email.trim()) {
      throw new AppError(400, "Email is required");
    }

    const existing = await this.clientRepository.findByEmail(input.email.trim().toLowerCase());
    if (existing) {
      throw new AppError(409, "A client with this email already exists");
    }

    // Business rule: name is required
    if (!input.name || !input.name.trim()) {
      throw new AppError(400, "Name is required");
    }

    const client = await this.clientRepository.create({
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
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

    return this.toResponse(client);
  }

  private toResponse(client: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    company: string | null;
    cep: string | null;
    street: string | null;
    number: string | null;
    neighborhood: string | null;
    city: string | null;
    state: string | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): ClientResponse {
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