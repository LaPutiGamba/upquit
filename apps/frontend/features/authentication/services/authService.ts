import { apiClient } from "@/shared/lib/apiClient";

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
  isActive: boolean;
  isEmailVerified: boolean;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return await apiClient<AuthResponse>("/users/login", {
      method: "POST",
      body: JSON.stringify(credentials)
    });
  },

  register: async (credentials: RegisterCredentials): Promise<UserResponse> => {
    return await apiClient<UserResponse>("/users/register", {
      method: "POST",
      body: JSON.stringify(credentials)
    });
  }
};
