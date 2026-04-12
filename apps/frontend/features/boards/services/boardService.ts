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

export interface CreateBoardPayload {
  name: string;
  slug: string;
  description?: string;
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
  }
};
