import { API_URL, REQUEST_TIMEOUT_MS } from '@/api/config';

export type Tokens = { access: string; refresh: string };

/** A failed request, with a message that can be shown to staff as-is. */
export class ApiError extends Error {
  constructor(
    /** HTTP status, or 0 when the server could not be reached. */
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const errorMessage = (error: unknown) =>
  error instanceof ApiError ? error.message : 'Something went wrong. Please try again.';

let tokens: Tokens | null = null;
let onTokensRefreshed: (tokens: Tokens) => void = () => {};
let onSessionExpired: () => void = () => {};

/** Called by the session provider so the client can attach, refresh and drop tokens. */
export function setSessionTokens(next: Tokens | null) {
  tokens = next;
}

export const currentRefreshToken = () => tokens?.refresh ?? null;

export function setSessionCallbacks(callbacks: { onTokensRefreshed: (tokens: Tokens) => void; onSessionExpired: () => void }) {
  onTokensRefreshed = callbacks.onTokensRefreshed;
  onSessionExpired = callbacks.onSessionExpired;
}

async function send(path: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(`${API_URL}${path}`, { ...init, signal: controller.signal });
  } catch {
    throw new ApiError(0, "Can't reach the Bara server. Check the internet connection and try again.");
  } finally {
    clearTimeout(timer);
  }
}

/** DRF errors come as `{ detail }`, `{ message }` or `{ field: ["…"] }`. */
function readMessage(body: unknown): string | undefined {
  if (typeof body === 'string') return body;
  if (Array.isArray(body)) return readMessage(body[0]);
  if (body && typeof body === 'object') {
    const record = body as Record<string, unknown>;
    for (const key of ['detail', 'message', 'non_field_errors', 'error']) {
      const message = readMessage(record[key]);
      if (message) return message;
    }
    for (const [field, value] of Object.entries(record)) {
      const message = readMessage(value);
      if (message) return `${field.replace(/_/g, ' ')}: ${message}`;
    }
  }
  return undefined;
}

async function errorFrom(response: Response): Promise<ApiError> {
  let message =
    response.status >= 500
      ? 'The Bara server had a problem. Please try again in a moment.'
      : `Request failed (${response.status}).`;
  try {
    message = readMessage(await response.json()) ?? message;
  } catch {
    // Not JSON (e.g. the HTML error page Django returns for a 500).
  }
  return new ApiError(response.status, message);
}

let refreshing: Promise<boolean> | null = null;

/** Swap the refresh token for a new access token; concurrent 401s share one refresh. */
function refreshAccess(): Promise<boolean> {
  const current = tokens;
  if (!current) return Promise.resolve(false);
  refreshing ??= (async () => {
    const response = await send('/auth/refresh/', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: current.refresh }),
    });
    if (!response.ok) return false;
    const body = (await response.json()) as Partial<Tokens>;
    if (!body.access) return false;
    tokens = { access: body.access, refresh: body.refresh ?? current.refresh };
    onTokensRefreshed(tokens);
    return true;
  })()
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

type RequestOptions = { method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; body?: unknown; auth?: boolean };

export async function request<T>(path: string, { method = 'GET', body, auth = true }: RequestOptions = {}): Promise<T> {
  const attempt = () =>
    send(path, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...(auth && tokens && { Authorization: `Bearer ${tokens.access}` }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

  let response = await attempt();
  if (response.status === 401 && auth && tokens) {
    if (await refreshAccess()) {
      response = await attempt();
    } else {
      onSessionExpired();
      throw new ApiError(401, 'Your session has expired. Please sign in again.');
    }
  }
  if (!response.ok) throw await errorFrom(response);
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { method: 'POST', body, ...options }),
};
