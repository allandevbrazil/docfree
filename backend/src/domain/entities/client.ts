/**
 * Client Entity
 *
 * Represents a customer in the DocPrático system.
 * This is a pure domain entity with no framework dependencies.
 */
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
  createdAt: Date;
  updatedAt: Date;
}