import { apiClient, setAccessToken } from "@/shared/lib/apiClient";

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface RegisterCredentials {
  email: string;
  displayName: string;
  password?: string;
  oauthProvider?: string;
  oauthId?: string;
  avatarUrl?: string;
}

interface AuthResponse {
  accessToken: string;
}

export interface UserResponse {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  emailVerified: boolean;
  isActive: boolean;
}

export interface UpdateUserPayload {
  displayName?: string;
  avatarUrl?: string | null;
  emailVerified?: boolean;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient<AuthResponse>("/users/login", {
      method: "POST",
      body: JSON.stringify(credentials)
    });

    setAccessToken(response.accessToken);
    return response;
  },

  register: async (credentials: RegisterCredentials): Promise<UserResponse> => {
    return await apiClient<UserResponse>("/users/register", {
      method: "POST",
      body: JSON.stringify(credentials)
    });
  },

  getUserProfile: async (userId: string, token?: string): Promise<UserResponse> => {
    return await apiClient<UserResponse>(`/users/${userId}`, {
      method: "GET",
      token
    });
  },

  updateUser: async (userId: string, payload: UpdateUserPayload, token?: string): Promise<UserResponse> => {
    return await apiClient<UserResponse>(`/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
      token
    });
  },

  verifyEmail: async (userId: string): Promise<void> => {
    await apiClient(`/users/${userId}/verify-email`, {
      method: "POST"
    });
  },

  refreshSession: async (): Promise<AuthResponse> => {
    const response = await apiClient<AuthResponse>("/users/refresh", {
      method: "POST"
    });

    setAccessToken(response.accessToken);
    return response;
  },

  logout: async (): Promise<void> => {
    await apiClient("/users/logout", {
      method: "POST"
    });
    setAccessToken(null);
  }
};
