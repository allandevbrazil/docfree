import { Client } from "../entities/client";

/**
 * Client Repository Interface
 *
 * Defines the contract for client data access.
 * The infrastructure layer implements this interface.
 * This keeps the domain layer decoupled from any ORM/framework.
 */
export interface ClientRepository {
  /**
   * Find a client by its unique identifier.
   */
  findById(id: string): Promise<Client | null>;

  /**
   * Find a client by its email address.
   */
  findByEmail(email: string): Promise<Client | null>;

  /**
   * List clients with pagination and optional filters.
   */
  findMany(params: FindClientsParams): Promise<FindClientsResult>;

  /**
   * Create a new client.
   */
  create(data: CreateClientData): Promise<Client>;

  /**
   * Update an existing client.
   */
  update(id: string, data: UpdateClientData): Promise<Client | null>;

  /**
   * Delete a client by its unique identifier.
   */
  delete(id: string): Promise<boolean>;
}

export interface FindClientsParams {
  page: number;
  pageSize: number;
  search?: string;
  city?: string;
  state?: string;
}

export interface FindClientsResult {
  data: Client[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateClientData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  cep?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  notes?: string;
}

export interface UpdateClientData {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  cep?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  notes?: string;
}