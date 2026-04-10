const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

interface FetchOptions extends RequestInit {
  token?: string;
  tenantId?: string;
}

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiClient<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${BACKEND_URL}${normalizedEndpoint}`;

  const { token, tenantId, ...fetchOptions } = options;

  const headers = new Headers(fetchOptions.headers);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (tenantId) {
    headers.set("X-Tenant-Id", tenantId);
  }

  const config: RequestInit = {
    ...fetchOptions,
    headers
  };

  try {
    const response = await fetch(url, config);

    if (response.status === 204) {
      return null as T;
    }

    const data = await response.json();

    if (!response.ok) {
      let errorMessage = `HTTP Error: ${response.status}`;

      if (data?.error) {
        if (typeof data.error === "string" && data.message) {
          errorMessage = data.message;
        } else if (typeof data.error === "object" && data.error.message) {
          errorMessage = data.error.message;
        }
      }

      throw new ApiError(errorMessage);
    }

    return data as T;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new ApiError("An unexpected network error occurred while communicating with the server.");
  }
}
