const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";
const REFRESH_ENDPOINT = "/users/refresh";
const TOKEN_REFRESH_EXCLUDED_ENDPOINTS = new Set([REFRESH_ENDPOINT, "/users/login"]);

let inMemoryAccessToken: string | null = null;
let refreshAccessTokenPromise: Promise<string | null> | null = null;

interface FetchOptions extends RequestInit {
  token?: string;
  tenantId?: string;
  next?: {
    revalidate?: number;
  };
}

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "Your session has expired. Please sign in again.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export function setAccessToken(token: string | null): void {
  if (typeof window === "undefined") {
    return;
  }

  inMemoryAccessToken = token;
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return inMemoryAccessToken;
}

function shouldAttemptTokenRefresh(endpoint: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return !TOKEN_REFRESH_EXCLUDED_ENDPOINTS.has(normalizedEndpoint);
}

async function parseJsonResponse(response: Response): Promise<Record<string, unknown> | null> {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function refreshAccessToken(): Promise<string | null> {
  try {
    const response = await fetch(`${BACKEND_URL}${REFRESH_ENDPOINT}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      setAccessToken(null);
      return null;
    }

    const data = await parseJsonResponse(response);
    const accessToken = typeof data?.accessToken === "string" ? data.accessToken : null;

    setAccessToken(accessToken);
    return accessToken;
  } catch {
    setAccessToken(null);
    return null;
  }
}

async function refreshAccessTokenOnce(): Promise<string | null> {
  if (!refreshAccessTokenPromise) {
    refreshAccessTokenPromise = refreshAccessToken().finally(() => {
      refreshAccessTokenPromise = null;
    });
  }

  return refreshAccessTokenPromise;
}

function extractErrorMessage(status: number, data: Record<string, unknown> | null): string {
  let errorMessage = `HTTP Error: ${status}`;

  if (data && typeof data === "object" && "error" in data) {
    const error = data.error;

    if (typeof error === "string" && "message" in data && typeof data.message === "string") {
      errorMessage = data.message;
    } else if (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof (error as Record<string, unknown>).message === "string"
    ) {
      errorMessage = (error as Record<string, unknown>).message as string;
    }
  }

  return errorMessage;
}

export async function apiClient<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${BACKEND_URL}${normalizedEndpoint}`;

  const { token, tenantId, ...fetchOptions } = options;

  const headers = new Headers(fetchOptions.headers);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const effectiveToken = token ?? getAccessToken();
  if (effectiveToken) {
    headers.set("Authorization", `Bearer ${effectiveToken}`);
  }

  if (tenantId) {
    headers.set("X-Tenant-Id", tenantId);
  }

  const config: RequestInit = {
    ...fetchOptions,
    headers,
    credentials: fetchOptions.credentials ?? "include"
  };

  try {
    let response = await fetch(url, config);

    if (response.status === 401 && shouldAttemptTokenRefresh(normalizedEndpoint)) {
      const refreshedToken = await refreshAccessTokenOnce();

      if (!refreshedToken) {
        throw new UnauthorizedError();
      }

      const retryHeaders = new Headers(config.headers);
      retryHeaders.set("Authorization", `Bearer ${refreshedToken}`);

      response = await fetch(url, {
        ...config,
        headers: retryHeaders
      });
    }

    if (response.status === 204) {
      return null as T;
    }

    const data = await parseJsonResponse(response);

    if (!response.ok) {
      throw new ApiError(extractErrorMessage(response.status, data));
    }

    return data as T;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new ApiError("An unexpected network error occurred while communicating with the server.");
  }
}
