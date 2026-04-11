import Comment from "../../domain/entities/Comment.js";

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

export function mapCommentToResponse(
  comment: Comment,
  authorDisplayName: string | null = null,
  authorAvatarUrl: string | null = null
): CommentResponse {
  return {
    id: comment.id.getValue(),
    requestId: comment.requestId.getValue(),
    userId: comment.userId.getValue(),
    authorDisplayName,
    authorAvatarUrl,
    parentId: comment.parentId?.getValue() ?? null,
    content: comment.content,
    isAdminReply: comment.isAdminReply,
    createdAt: comment.createdAt
  };
}
