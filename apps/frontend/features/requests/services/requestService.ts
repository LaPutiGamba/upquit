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
  authorDisplayName?: string | null;
  authorAvatarUrl?: string | null;
  authorUsername?: string | null;
  authorIsActive?: boolean | null;
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
  deletedCategories?: { categoryId: string; categoryName: string }[];
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

export interface SubscriptionResponse {
  userId: string;
  requestId: string;
  createdAt: string | null;
}

export function getRequestCategoryIds(request: Pick<RequestResponse, "categoryIds" | "categories">): string[] {
  if (request.categoryIds !== undefined) {
    return request.categoryIds;
  }

  return request.categories?.map((category) => category.id) ?? [];
}

export interface GetRequestsFilters {
  status?: string[];
  categoryId?: string;
  search?: string;
  sortBy?: "newest" | "oldest" | "recently_updated";
  authorId?: string;
  pinnedOnly?: boolean;
  excludePinned?: boolean;
  limit?: number;
  offset?: number;
}

export const requestService = {
  getRequestsByBoardId: async (boardId: string, filters?: GetRequestsFilters): Promise<RequestResponse[]> => {
    const params = new URLSearchParams();
    params.set("boardId", boardId);

    if (filters?.status) {
      for (const s of filters.status) {
        params.append("status", s);
      }
    }
    if (filters?.categoryId) {
      params.set("categoryId", filters.categoryId);
    }
    if (filters?.search) {
      params.set("search", filters.search);
    }
    if (filters?.sortBy) {
      params.set("sortBy", filters.sortBy);
    }
    if (filters?.authorId) {
      params.set("authorId", filters.authorId);
    }
    if (filters?.pinnedOnly) {
      params.set("pinnedOnly", "true");
    }
    if (filters?.excludePinned) {
      params.set("excludePinned", "true");
    }
    if (filters?.limit) {
      params.set("limit", String(filters.limit));
    }
    if (filters?.offset) {
      params.set("offset", String(filters.offset));
    }

    return await apiClient<RequestResponse[]>(`/requests?${params.toString()}`, {
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

  subscribeToRequest: async (id: string, boardId: string): Promise<SubscriptionResponse> => {
    return await apiClient<SubscriptionResponse>(`/requests/${id}/subscriptions`, {
      method: "POST",
      tenantId: boardId
    });
  },

  unsubscribeFromRequest: async (id: string, boardId: string): Promise<void> => {
    await apiClient<void>(`/requests/${id}/subscriptions`, {
      method: "DELETE",
      tenantId: boardId
    });
  },

  isSubscribedToRequest: async (id: string, boardId: string): Promise<boolean> => {
    const response = await apiClient<{ isSubscribed: boolean }>(`/requests/${id}/subscriptions`, {
      method: "GET",
      tenantId: boardId
    });

    return response.isSubscribed ?? false;
  },

  deleteRequest: async (id: string): Promise<void> => {
    await apiClient<void>(`/requests/${id}`, {
      method: "DELETE"
    });
  },

  getRequestChangelogByRequestId: async (
    requestId: string,
    boardId: string,
    filters?: { field?: string[]; userId?: string; search?: string; limit?: number; offset?: number }
  ): Promise<RequestChangelogResponse[]> => {
    const params = new URLSearchParams();
    if (filters?.field) {
      for (const field of filters.field) {
        params.append("field", field);
      }
    }
    if (filters?.userId) params.set("userId", filters.userId);
    if (filters?.search) params.set("search", filters.search);
    if (filters?.limit) params.set("limit", String(filters.limit));
    if (filters?.offset) params.set("offset", String(filters.offset));

    const queryString = params.toString();
    const url = `/requests/${requestId}/changelog${queryString ? `?${queryString}` : ""}`;

    return await apiClient<RequestChangelogResponse[]>(url, {
      method: "GET",
      cache: "no-store",
      tenantId: boardId
    });
  }
};
