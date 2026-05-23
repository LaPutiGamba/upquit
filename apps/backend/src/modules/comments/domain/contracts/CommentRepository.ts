import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import Comment, { CommentWithAuthor } from "../entities/Comment.js";
import type { CommentSortOrder } from "../../application/queries/GetCommentsByRequestIdQuery.js";

export interface FindCommentsFilters {
  sortBy?: CommentSortOrder;
  adminOnly?: boolean;
  limit?: number;
  offset?: number;
}

export default interface CommentRepository {
  findById(id: Uuid): Promise<Comment | null>;
  findByIdWithAuthor(id: Uuid): Promise<CommentWithAuthor | null>;
  findByRequestId(requestId: Uuid, filters?: FindCommentsFilters): Promise<Comment[]>;
  findByRequestIdWithAuthor(requestId: Uuid, filters?: FindCommentsFilters): Promise<CommentWithAuthor[]>;
  findByParentId(parentId: Uuid): Promise<Comment[]>;
  save(comment: Comment): Promise<void>;
  update(comment: Comment): Promise<void>;
  delete(id: Uuid): Promise<void>;
}
