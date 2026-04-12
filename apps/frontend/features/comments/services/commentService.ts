import { apiClient } from "@/shared/lib/apiClient";

export default interface CommentResponse {
  id: string;
  requestId: string;
  userId: string;
  authorDisplayName: string | null;
  authorAvatarUrl: string | null;
  parentId: string | null;
  content: string;
  isAdminReply: boolean | null;
  createdAt: Date | null;
}

export const commentService = {
  async getCommentsByRequestId(requestId: string, boardId: string): Promise<CommentResponse[]> {
    const response = await apiClient<CommentResponse[]>(`/comments?requestId=${requestId}`, {
      method: "GET",
      cache: "no-store",
      tenantId: boardId
    });
    return response;
  },

  async createComment(requestId: string, boardId: string, text: string, token?: string): Promise<CommentResponse> {
    const response = await apiClient<CommentResponse>(`/comments`, {
      method: "POST",
      tenantId: boardId,
      token,
      body: JSON.stringify({
        requestId,
        content: text,
        parentId: null,
        isAdminReply: null
      })
    });
    return response;
  }
};
