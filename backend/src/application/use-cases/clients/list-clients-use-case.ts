import { ClientRepository } from "../../../domain/repositories/client-repository";
import { ListClientsParams, ListClientsResult } from "../../dtos/client-dto";

/**
 * List Clients Use Case
 *
 * Retrieves a paginated list of clients with optional filters.
 * Formats the response exactly as the front-end needs.
 */
export class ListClientsUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute(params: ListClientsParams): Promise<ListClientsResult> {
    const { page, pageSize, search, city, state } = params;

    const result = await this.clientRepository.findMany({
      page,
      pageSize,
      search,
      city,
      state,
    });

    return {
      data: result.data.map((client) => ({
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
      })),
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages,
        summary: `Mostrando ${result.data.length} de ${result.total} registros`,
      },
    };
  }
}