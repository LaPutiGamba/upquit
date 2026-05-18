import { apiClient, setAccessToken } from "@/shared/lib/apiClient";

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface RegisterCredentials {
  username: string;
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
  username: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: Date;
}

export interface UpdateUserPayload {
  username?: string;
  displayName?: string;
  avatarUrl?: string | null;
  emailVerified?: boolean;
}

export interface UsernameAvailabilityResponse {
  username: string;
  available: boolean;
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

  checkUsernameAvailability: async (username: string): Promise<UsernameAvailabilityResponse> => {
    return await apiClient<UsernameAvailabilityResponse>(
      `/users/username-available?username=${encodeURIComponent(username)}`,
      {
        method: "GET"
      }
    );
  },

  getUserProfile: async (userId: string, token?: string): Promise<UserResponse> => {
    return await apiClient<UserResponse>(`/users/${userId}`, {
      method: "GET",
      token
    });
  },

  getUserByUsername: async (username: string): Promise<UserResponse> => {
    return await apiClient<UserResponse>(`/users/username/${encodeURIComponent(username)}`, {
      method: "GET"
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
  },

  requestPasswordReset: async (email: string): Promise<{ message: string }> => {
    return await apiClient<{ message: string }>("/users/request-password-reset", {
      method: "POST",
      body: JSON.stringify({ email })
    });
  },

  resetPassword: async (token: string, newPassword: string): Promise<UserResponse> => {
    return await apiClient<UserResponse>("/users/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword })
    });
  }
};

export const handleGoogleOAuthCallback = async (searchParams: Record<string, string | string[] | undefined>) => {
  const token = Array.isArray(searchParams.token) ? searchParams.token[0] : searchParams.token;
  const error = Array.isArray(searchParams.error) ? searchParams.error[0] : searchParams.error;

  if (error) {
    throw new Error(`Google OAuth error: ${error}`);
  }

  if (!token) {
    throw new Error("No access token provided");
  }

  setAccessToken(token);
  return { accessToken: token };
};
