import { apiClient } from "@/shared/lib/apiClient";

export interface BoardResponse {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  ownerId: string;
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

export const boardService = {
  getMyBoards: async (token?: string): Promise<BoardResponse[]> => {
    return await apiClient<BoardResponse[]>("/boards/mine", {
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

  getBoardMembers: async (boardId: string, token?: string): Promise<BoardMember[]> => {
    return await apiClient<BoardMember[]>(`/boards/${boardId}/members`, {
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
