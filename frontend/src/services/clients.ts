import type {
  Client,
  ClientInput,
  ClientListParams,
  ClientListResult,
} from "../types/client";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

function buildQuery(params: ClientListParams): string {
  const query = new URLSearchParams();
  if (params.page !== undefined) query.set("page", String(params.page));
  if (params.pageSize !== undefined)
    query.set("pageSize", String(params.pageSize));
  if (params.search !== undefined && params.search.trim() !== "")
    query.set("search", params.search.trim());
  if (params.city !== undefined && params.city.trim() !== "")
    query.set("city", params.city.trim());
  if (params.state !== undefined && params.state.trim() !== "")
    query.set("state", params.state.trim());
  return query.toString();
}

async function parseError(response: Response, fallback: string): Promise<string> {
  try {
    const body = (await response.json()) as { error?: { message?: string } };
    if (body.error?.message) return body.error.message;
  } catch {
    // ignore JSON parse errors, use the default message
  }
  return fallback;
}

/** GET /api/clients?page=&pageSize=&search=&city=&state= */
export async function fetchClients(
  params: ClientListParams = {}
): Promise<ClientListResult> {
  const query = buildQuery(params);
  const url = `${API_BASE_URL}/api/clients${query ? `?${query}` : ""}`;

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(
      await parseError(response, `Erro ${response.status} ao listar clientes`)
    );
  }

  return (await response.json()) as ClientListResult;
}

/** GET /api/clients/{id} */
export async function fetchClientById(id: string): Promise<Client> {
  const response = await fetch(`${API_BASE_URL}/api/clients/${id}`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(
      await parseError(response, `Erro ${response.status} ao buscar cliente`)
    );
  }

  return (await response.json()) as Client;
}

/** POST /api/clients */
export async function createClient(input: ClientInput): Promise<Client> {
  const response = await fetch(`${API_BASE_URL}/api/clients`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(
      await parseError(response, `Erro ${response.status} ao criar cliente`)
    );
  }

  return (await response.json()) as Client;
}

/** PUT /api/clients/{id} */
export async function updateClient(
  id: string,
  input: Partial<ClientInput>
): Promise<Client> {
  const response = await fetch(`${API_BASE_URL}/api/clients/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(
      await parseError(response, `Erro ${response.status} ao atualizar cliente`)
    );
  }

  return (await response.json()) as Client;
}

/** DELETE /api/clients/{id} */
export async function deleteClient(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/clients/${id}`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(
      await parseError(response, `Erro ${response.status} ao excluir cliente`)
    );
  }
}