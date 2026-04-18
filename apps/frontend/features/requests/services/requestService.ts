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

export type RequestStatusValue = "open" | "planned" | "in_progress" | "completed" | "rejected";

export interface UpdateRequestPayload {
  title?: string;
  description?: string | null;
  status?: RequestStatusValue;
}

export const requestService = {
  getRequestsByBoardId: async (boardId: string): Promise<RequestResponse[]> => {
    return await apiClient<RequestResponse[]>(`/requests?boardId=${boardId}`, {
      method: "GET",
      cache: "no-store",
      tenantId: boardId
    });
  },

  getRequestById: async (id: string, boardId: string): Promise<RequestResponse> => {
    return await apiClient<RequestResponse>(`/requests/${id}`, {
      method: "GET",
      cache: "no-store",
      tenantId: boardId
    });
  },

  createRequest: async (
    boardId: string,
    title: string,
    description: string | null,
    token?: string
  ): Promise<RequestResponse> => {
    return await apiClient<RequestResponse>(`/requests`, {
      method: "POST",
      tenantId: boardId,
      token,
      body: JSON.stringify({
        boardId,
        title,
        description: description ?? null,
        categoryId: null,
        status: "open",
        voteCount: 0,
        isPinned: false,
        isHidden: false,
        adminNote: null
      })
    });
  },

  updateRequest: async (id: string, boardId: string, payload: UpdateRequestPayload): Promise<RequestResponse> => {
    return await apiClient<RequestResponse>(`/requests/${id}`, {
      method: "PATCH",
      tenantId: boardId,
      body: JSON.stringify(payload)
    });
  }
};
