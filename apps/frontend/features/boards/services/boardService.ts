import { apiClient } from "@/shared/lib/apiClient";

export interface BoardResponse {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  ownerId: string;
  ownerDisplayName?: string | null;
  ownerAvatarUrl?: string | null;
  ownerUsername?: string | null;
  ownerIsActive?: boolean | null;
  isPublic: boolean | null;
  allowAnonymousVotes: boolean | null;
  giveToGetEnabled: boolean | null;
  giveToGetVotesReq: number | null;
  giveToGetCommentsReq: number | null;
  createdAt: string | null;
}

export type BoardMemberRole = "admin" | "member";

export interface BoardMember {
  userId: string;
  boardId: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  role: BoardMemberRole;
  createdAt: string | null;
}

export interface CreateBoardPayload {
  name: string;
  slug: string;
  description?: string;
}

export interface UpdateBoardPayload {
  slug?: string;
  name?: string;
  description?: string | null;
  logoUrl?: string | null;
  primaryColor?: string | null;
  ownerId?: string;
  isPublic?: boolean | null;
  allowAnonymousVotes?: boolean | null;
  giveToGetEnabled?: boolean | null;
  giveToGetVotesReq?: number | null;
  giveToGetCommentsReq?: number | null;
}

export interface CategoryResponse {
  id: string;
  boardId: string;
  name: string;
  hexColor?: string;
  createdAt: string | null;
}

export type PublicBoardSortBy = "recent" | "name" | "members";

export const boardService = {
  getMyBoards: async (
    filters?: { search?: string; sortBy?: "name" | "recent"; limit?: number; offset?: number },
    token?: string
  ): Promise<BoardResponse[]> => {
    const params = new URLSearchParams();
    if (filters?.search) params.set("search", filters.search);
    if (filters?.sortBy) params.set("sortBy", filters.sortBy);
    if (filters?.limit) params.set("limit", String(filters.limit));
    if (filters?.offset) params.set("offset", String(filters.offset));

    const queryString = params.toString();
    const url = `/boards/mine${queryString ? `?${queryString}` : ""}`;

    return await apiClient<BoardResponse[]>(url, {
      method: "GET",
      token
    });
  },

  getPublicBoardsByUserId: async (userId: string): Promise<BoardResponse[]> => {
    return await apiClient<BoardResponse[]>(`/boards/user/${userId}/public`, {
      method: "GET"
    });
  },

  searchPublicBoards: async (
    params: { search?: string; sortBy?: PublicBoardSortBy; limit?: number; offset?: number },
    token?: string
  ): Promise<BoardResponse[]> => {
    const query = new URLSearchParams();

    if (params.search) {
      query.set("search", params.search);
    }
    if (params.sortBy) {
      query.set("sortBy", params.sortBy);
    }
    if (params.limit !== undefined) {
      query.set("limit", String(params.limit));
    }
    if (params.offset !== undefined) {
      query.set("offset", String(params.offset));
    }

    const suffix = query.toString();

    return await apiClient<BoardResponse[]>(suffix ? `/boards/discover?${suffix}` : "/boards/discover", {
      method: "GET",
      token
    });
  },

  getBoardById: async (id: string, token?: string): Promise<BoardResponse> => {
    return await apiClient<BoardResponse>(`/boards/${id}`, {
      method: "GET",
      token
    });
  },

  getBoardBySlug: async (slug: string, token?: string): Promise<BoardResponse> => {
    return await apiClient<BoardResponse>(`/boards/slug/${slug}`, {
      method: "GET",
      token
    });
  },

  createBoard: async (payload: CreateBoardPayload, token?: string): Promise<BoardResponse> => {
    return await apiClient<BoardResponse>("/boards", {
      method: "POST",
      body: JSON.stringify(payload),
      token
    });
  },

  updateBoard: async (id: string, payload: UpdateBoardPayload, token?: string): Promise<BoardResponse> => {
    return await apiClient<BoardResponse>(`/boards/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
      token
    });
  },

  deleteBoard: async (id: string, token?: string): Promise<void> => {
    await apiClient(`/boards/${id}`, {
      method: "DELETE",
      token
    });
  },

  getBoardMembers: async (
    boardId: string,
    filters?: { role?: "admin" | "member"; search?: string; limit?: number; offset?: number },
    token?: string
  ): Promise<BoardMember[]> => {
    const params = new URLSearchParams();
    if (filters?.role) params.set("role", filters.role);
    if (filters?.search) params.set("search", filters.search);
    if (filters?.limit) params.set("limit", String(filters.limit));
    if (filters?.offset) params.set("offset", String(filters.offset));

    const queryString = params.toString();
    const url = `/boards/${boardId}/members${queryString ? `?${queryString}` : ""}`;

    return await apiClient<BoardMember[]>(url, {
      method: "GET",
      token
    });
  },

  addBoardMember: async (boardId: string, email: string, token?: string): Promise<void> => {
    await apiClient(`/boards/${boardId}/members`, {
      method: "POST",
      body: JSON.stringify({ email, role: "member" }),
      token
    });
  },

  joinBoard: async (boardId: string, token?: string): Promise<void> => {
    await apiClient(`/boards/${boardId}/join`, {
      method: "POST",
      token
    });
  },

  updateBoardMemberRole: async (
    boardId: string,
    userId: string,
    role: BoardMemberRole,
    token?: string
  ): Promise<void> => {
    await apiClient(`/boards/${boardId}/members/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
      token
    });
  },

  removeBoardMember: async (boardId: string, userId: string, token?: string): Promise<void> => {
    await apiClient(`/boards/${boardId}/members/${userId}`, {
      method: "DELETE",
      token
    });
  },

  getBoardCategories: async (boardId: string, token?: string): Promise<CategoryResponse[]> => {
    return await apiClient<CategoryResponse[]>(`/boards/${boardId}/categories`, {
      method: "GET",
      token
    });
  },

  addBoardCategory: async (boardId: string, name: string, token?: string): Promise<CategoryResponse> => {
    return await apiClient<CategoryResponse>(`/boards/${boardId}/categories`, {
      method: "POST",
      body: JSON.stringify({ name }),
      token
    });
  }
};
