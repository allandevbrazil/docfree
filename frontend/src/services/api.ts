import type { DashboardDTO, DashboardParams } from "../types/dashboard";

/**
 * API base URL.
 * In development the Vite proxy forwards /api to http://localhost:3333.
 * In production, set VITE_API_BASE_URL to the deployed backend URL.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

/**
 * Fetches the full Dashboard payload (BFF pattern) from the backend.
 * GET /api/dashboard?page=&pageSize=&status=&clientName=
 */
export async function fetchDashboard(
  params: DashboardParams = {}
): Promise<DashboardDTO> {
  const query = new URLSearchParams();

  if (params.page !== undefined) query.set("page", String(params.page));
  if (params.pageSize !== undefined)
    query.set("pageSize", String(params.pageSize));
  if (params.status !== undefined) query.set("status", params.status);
  if (params.clientName !== undefined && params.clientName.trim() !== "")
    query.set("clientName", params.clientName.trim());

  const queryString = query.toString();
  const url = `${API_BASE_URL}/api/dashboard${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    let message = `Erro ${response.status} ao carregar o dashboard`;
    try {
      const body = (await response.json()) as { error?: { message?: string } };
      if (body.error?.message) message = body.error.message;
    } catch {
      // ignore JSON parse errors, use the default message
    }
    throw new Error(message);
  }

  return (await response.json()) as DashboardDTO;
}