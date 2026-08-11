import { Request, Response } from "express";
import { CreateClientUseCase } from "../../application/use-cases/clients/create-client-use-case";
import { GetClientUseCase } from "../../application/use-cases/clients/get-client-use-case";
import { ListClientsUseCase } from "../../application/use-cases/clients/list-clients-use-case";
import { UpdateClientUseCase } from "../../application/use-cases/clients/update-client-use-case";
import { DeleteClientUseCase } from "../../application/use-cases/clients/delete-client-use-case";

/**
 * Client Controller
 *
 * Handles HTTP requests for the Client feature.
 * Injects use cases via constructor (dependency injection).
 */
export class ClientController {
  constructor(
    private readonly createClientUseCase: CreateClientUseCase,
    private readonly getClientUseCase: GetClientUseCase,
    private readonly listClientsUseCase: ListClientsUseCase,
    private readonly updateClientUseCase: UpdateClientUseCase,
    private readonly deleteClientUseCase: DeleteClientUseCase
  ) {}

  /**
   * GET /clients
   * Returns a paginated list of clients with optional filters.
   */
  async list(req: Request, res: Response): Promise<void> {
    const page = this.parsePositiveInt(req.query.page, 1);
    const pageSize = this.parsePositiveInt(req.query.pageSize, 10);
    const search = this.parseString(req.query.search);
    const city = this.parseString(req.query.city);
    const state = this.parseString(req.query.state);

    const result = await this.listClientsUseCase.execute({
      page,
      pageSize,
      search,
      city,
      state,
    });

    res.json(result);
  }

  /**
   * GET /clients/:id
   * Returns a single client by its unique identifier.
   */
  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const client = await this.getClientUseCase.execute(id);

    res.json(client);
  }

  /**
   * POST /clients
   * Creates a new client.
   */
  async create(req: Request, res: Response): Promise<void> {
    const client = await this.createClientUseCase.execute(req.body);

    res.status(201).json(client);
  }

  /**
   * PUT /clients/:id
   * Updates an existing client.
   */
  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const client = await this.updateClientUseCase.execute(id, req.body);

    res.json(client);
  }

  /**
   * DELETE /clients/:id
   * Deletes a client by its unique identifier.
   */
  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const result = await this.deleteClientUseCase.execute(id);

    res.json(result);
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  private parsePositiveInt(value: unknown, defaultValue: number): number {
    if (typeof value !== "string") {
      return defaultValue;
    }
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed < 1) {
      return defaultValue;
    }
    return parsed;
  }

  private parseString(value: unknown): string | undefined {
    if (typeof value !== "string" || value.trim() === "") {
      return undefined;
    }
    return value.trim();
  }
}