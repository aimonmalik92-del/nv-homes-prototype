/**
 * Thin fetch wrapper for the NV Homes API.
 *
 * - Base URL from VITE_API_BASE_URL (empty in dev: Vite proxies /api to :8000).
 * - Adds the Bearer token, JSON headers and a timeout.
 * - Throws ApiError with the server's {detail, code, field} so forms can
 *   highlight the right input.
 */

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const TOKEN_KEY = "nvhomes.token";
const DEFAULT_TIMEOUT_MS = 15000;

export class ApiError extends Error {
  constructor(status, detail, code = null, field = null) {
    super(typeof detail === "string" ? detail : "Request failed");
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.field = field;
    // FastAPI validation errors: detail is a list of {loc, msg}
    this.errors = Array.isArray(detail) ? detail : null;
  }
}

// NOTE: localStorage keeps the token readable by any script on the page.
// Planned hardening: move to an httpOnly cookie issued by the API.
export const tokenStore = {
  get: () => {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  },
  set: (t) => {
    try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch { /* private mode */ }
  },
};

function buildUrl(path, query) {
  const url = new URL(BASE_URL + path, window.location.origin);
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
    });
  }
  return BASE_URL ? url.toString() : url.pathname + url.search;
}

/**
 * @param {string} path   e.g. "/api/projects/1/budget"
 * @param {{method?: string, body?: any, query?: object, signal?: AbortSignal, auth?: boolean}} [opts]
 */
export async function request(path, { method = "GET", body, query, signal, auth = true } = {}) {
  const headers = { Accept: "application/json" };
  if (body !== undefined && !(body instanceof FormData)) headers["Content-Type"] = "application/json";
  const token = auth ? tokenStore.get() : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  const timeout = new AbortController();
  const timer = setTimeout(() => timeout.abort(), DEFAULT_TIMEOUT_MS);
  signal?.addEventListener("abort", () => timeout.abort(), { once: true });

  let res;
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
      signal: timeout.signal,
    });
  } catch (e) {
    if (signal?.aborted) throw e;
    throw new ApiError(0, timeout.signal.aborted ? "The server took too long to respond." : "Can't reach the server.");
  } finally {
    clearTimeout(timer);
  }

  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401) tokenStore.set(null);
    throw new ApiError(res.status, data?.detail ?? res.statusText, data?.code, data?.field);
  }
  return data;
}
