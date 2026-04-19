import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import Comment, { CommentWithAuthor } from "../entities/Comment.js";

export default interface CommentRepository {
  findById(id: Uuid): Promise<Comment | null>;
  findByIdWithAuthor(id: Uuid): Promise<CommentWithAuthor | null>;
  findByRequestId(requestId: Uuid): Promise<Comment[]>;
  findByRequestIdWithAuthor(requestId: Uuid): Promise<CommentWithAuthor[]>;
  findByParentId(parentId: Uuid): Promise<Comment[]>;
  save(comment: Comment): Promise<void>;
  update(comment: Comment): Promise<void>;
  delete(id: Uuid): Promise<void>;
}
