import type {
  Quote,
  QuoteInput,
  QuoteListParams,
  QuoteListResult,
} from "../types/quote";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

function buildQuery(params: QuoteListParams): string {
  const query = new URLSearchParams();
  if (params.page !== undefined) query.set("page", String(params.page));
  if (params.pageSize !== undefined)
    query.set("pageSize", String(params.pageSize));
  if (params.status !== undefined) query.set("status", params.status);
  if (params.clientName !== undefined && params.clientName.trim() !== "")
    query.set("clientName", params.clientName.trim());
  if (params.projectName !== undefined && params.projectName.trim() !== "")
    query.set("projectName", params.projectName.trim());
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

/** GET /api/quotes?page=&pageSize=&status=&clientName=&projectName= */
export async function fetchQuotes(
  params: QuoteListParams = {}
): Promise<QuoteListResult> {
  const query = buildQuery(params);
  const url = `${API_BASE_URL}/api/quotes${query ? `?${query}` : ""}`;

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(
      await parseError(response, `Erro ${response.status} ao listar orçamentos`)
    );
  }

  return (await response.json()) as QuoteListResult;
}

/** GET /api/quotes/{id} */
export async function fetchQuoteById(id: string): Promise<Quote> {
  const response = await fetch(`${API_BASE_URL}/api/quotes/${id}`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(
      await parseError(response, `Erro ${response.status} ao buscar orçamento`)
    );
  }

  return (await response.json()) as Quote;
}

/** POST /api/quotes */
export async function createQuote(input: QuoteInput): Promise<Quote> {
  const response = await fetch(`${API_BASE_URL}/api/quotes`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(
      await parseError(response, `Erro ${response.status} ao criar orçamento`)
    );
  }

  return (await response.json()) as Quote;
}

/** PUT /api/quotes/{id} */
export async function updateQuote(
  id: string,
  input: Partial<QuoteInput>
): Promise<Quote> {
  const response = await fetch(`${API_BASE_URL}/api/quotes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(
      await parseError(response, `Erro ${response.status} ao atualizar orçamento`)
    );
  }

  return (await response.json()) as Quote;
}

/** DELETE /api/quotes/{id} */
export async function deleteQuote(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/quotes/${id}`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(
      await parseError(response, `Erro ${response.status} ao excluir orçamento`)
    );
  }
}