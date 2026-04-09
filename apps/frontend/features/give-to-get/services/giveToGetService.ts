import { apiClient } from "@/shared/lib/apiClient";

export interface GiveToGetProgressResponse {
  id: string;
  userId: string;
  boardId: string;
  votesGiven: number | null;
  qualifyingComments: number | null;
  canPost: boolean | null;
  unlockedAt: string | null;
}

export const giveToGetService = {
  getProgress: async (boardId: string, token: string): Promise<GiveToGetProgressResponse> => {
    return await apiClient<GiveToGetProgressResponse>(`/give-to-get?boardId=${boardId}`, {
      method: "GET",
      token
    });
  },

  createProgress: async (boardId: string, token: string): Promise<GiveToGetProgressResponse> => {
    return await apiClient<GiveToGetProgressResponse>("/give-to-get", {
      method: "POST",
      body: JSON.stringify({ boardId }),
      token
    });
  }
};
