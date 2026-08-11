export interface Client {
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

export interface ClientListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  city?: string;
  state?: string;
}

export interface ClientListResult {
  data: Client[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    summary: string;
  };
}

export type ClientInput = {
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
};