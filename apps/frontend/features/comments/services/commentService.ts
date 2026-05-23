import { apiClient } from "@/shared/lib/apiClient";

export default interface CommentResponse {
  id: string;
  requestId: string;
  userId: string;
  authorDisplayName: string | null;
  authorAvatarUrl: string | null;
  authorUsername: string | null;
  parentId: string | null;
  content: string;
  isAdminReply: boolean | null;
  createdAt: Date | null;
}

export interface CommentFilters {
  sortBy?: "newest_first" | "oldest_first";
  adminOnly?: boolean;
  limit?: number;
  offset?: number;
}

export const commentService = {
  async getCommentsByRequestId(
    requestId: string,
    boardId: string,
    filters?: CommentFilters
  ): Promise<CommentResponse[]> {
    const params = new URLSearchParams();
    params.set("requestId", requestId);

    if (filters?.sortBy) params.set("sortBy", filters.sortBy);
    if (filters?.adminOnly) params.set("adminOnly", "true");
    if (filters?.limit) params.set("limit", String(filters.limit));
    if (filters?.offset) params.set("offset", String(filters.offset));

    const response = await apiClient<CommentResponse[]>(`/comments?${params.toString()}`, {
      method: "GET",
      cache: "no-store",
      tenantId: boardId
    });
    return response;
  },

  async createComment(
    requestId: string,
    boardId: string,
    text: string,
    parentId?: string | null,
    isAdminReply?: boolean | null,
    token?: string
  ): Promise<CommentResponse> {
    const response = await apiClient<CommentResponse>(`/comments`, {
      method: "POST",
      tenantId: boardId,
      token,
      body: JSON.stringify({
        requestId,
        content: text,
        parentId: parentId || null,
        isAdminReply: isAdminReply ?? null
      })
    });
    return response;
  }
};
