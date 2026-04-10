import { apiClient } from "@/shared/lib/apiClient";

export interface VoteResponse {
  id: string;
  requestId: string;
  userId: string;
  boardId: string;
  createdAt: string;
}

export const voteService = {
  addVote: async (requestId: string, boardId: string, token: string): Promise<string> => {
    const response = await apiClient<VoteResponse>("/votes", {
      method: "POST",
      body: JSON.stringify({ requestId, boardId }),
      token,
      tenantId: boardId
    });
    return response.id;
  },

  removeVote: async (voteId: string, token: string): Promise<void> => {
    return await apiClient<void>(`/votes/${voteId}`, {
      method: "DELETE",
      token
    });
  },

  checkVote: async (requestId: string, userId: string, token: string): Promise<string | null> => {
    try {
      const response = await apiClient<VoteResponse>(`/votes?requestId=${requestId}&userId=${userId}`, {
        method: "GET",
        token
      });
      return response.id;
    } catch (error) {
      return null;
    }
  }
};
