import { apiClient } from "@/shared/lib/apiClient";

export interface RequestResponse {
  id: string;
  boardId: string;
  authorId: string;
  categoryId: string | null;
  title: string;
  description: string | null;
  status: string;
  voteCount: number | null;
  isPinned: boolean | null;
  isHidden: boolean | null;
  adminNote: string | null;
  createdAt: Date | null;
}

export const requestService = {
  getRequestsByBoardId: async (boardId: string): Promise<RequestResponse[]> => {
    return await apiClient<RequestResponse[]>(`/requests?boardId=${boardId}`, {
      method: "GET",
      cache: "no-store",
      tenantId: boardId
    });
  }
};
