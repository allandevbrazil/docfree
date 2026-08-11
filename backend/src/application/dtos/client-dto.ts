/**
 * Client DTOs
 *
 * Data Transfer Objects for the Client feature.
 * These define the contract between the presentation layer
 * and the application layer (use cases).
 */

export interface CreateClientInput {
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

export interface UpdateClientInput {
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

export interface ClientResponse {
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
  createdAt: string;
  updatedAt: string;
}

export interface ListClientsParams {
  page: number;
  pageSize: number;
  search?: string;
  city?: string;
  state?: string;
}

export interface ListClientsResult {
  data: ClientResponse[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    summary: string;
  };
}