import { apiClient } from "@/shared/lib/apiClient";

export interface RequestCategoryResponse {
  id: string;
  name: string;
  hexColor: string;
}

export interface RequestResponse {
  id: string;
  boardId: string;
  authorId: string;
  categoryIds?: string[];
  categories?: RequestCategoryResponse[];
  title: string;
  description: string | null;
  status: string;
  voteCount: number | null;
  isPinned: boolean | null;
  isHidden: boolean | null;
  adminNote: string | null;
  createdAt: Date | null;
}

export type RequestChangelogField =
  | "title"
  | "description"
  | "status"
  | "categoryIds"
  | "voteCount"
  | "isPinned"
  | "isHidden"
  | "adminNote";

export interface RequestChangelogResponse {
  id: string;
  requestId: string;
  userId: string;
  userDisplayName: string | null;
  field: RequestChangelogField;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string | null;
}

export type RequestStatusValue = "open" | "planned" | "in_progress" | "completed" | "rejected";

export interface CreateRequestPayload {
  boardId: string;
  title: string;
  description?: string | null;
  categoryIds?: string[];
  status?: RequestStatusValue;
  voteCount?: number;
  isPinned?: boolean;
  isHidden?: boolean;
  adminNote?: string | null;
}

export interface UpdateRequestPayload {
  title?: string;
  description?: string | null;
  status?: RequestStatusValue;
  categoryIds?: string[];
}

export function getRequestCategoryIds(request: Pick<RequestResponse, "categoryIds" | "categories">): string[] {
  if (request.categoryIds !== undefined) {
    return request.categoryIds;
  }

  return request.categories?.map((category) => category.id) ?? [];
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

  createRequest: async (payload: CreateRequestPayload, token?: string): Promise<RequestResponse> => {
    return await apiClient<RequestResponse>(`/requests`, {
      method: "POST",
      tenantId: payload.boardId,
      token,
      body: JSON.stringify({
        ...payload,
        description: payload.description ?? null,
        categoryIds: payload.categoryIds ?? [],
        status: payload.status ?? "open",
        voteCount: payload.voteCount ?? 0,
        isPinned: payload.isPinned ?? false,
        isHidden: payload.isHidden ?? false,
        adminNote: payload.adminNote ?? null
      })
    });
  },

  updateRequest: async (id: string, boardId: string, payload: UpdateRequestPayload): Promise<RequestResponse> => {
    return await apiClient<RequestResponse>(`/requests/${id}`, {
      method: "PATCH",
      tenantId: boardId,
      body: JSON.stringify(payload)
    });
  },

  getRequestChangelogByRequestId: async (requestId: string, boardId: string): Promise<RequestChangelogResponse[]> => {
    return await apiClient<RequestChangelogResponse[]>(`/requests/${requestId}/changelog`, {
      method: "GET",
      cache: "no-store",
      tenantId: boardId
    });
  }
};
