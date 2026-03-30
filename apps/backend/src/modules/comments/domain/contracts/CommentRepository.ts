import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import Comment from "../entities/Comment.js";

export default interface CommentRepository {
  findById(id: Uuid): Promise<Comment | null>;
  findByRequestId(requestId: Uuid): Promise<Comment[]>;
  findByParentId(parentId: Uuid): Promise<Comment[]>;
  save(comment: Comment): Promise<void>;
  update(comment: Comment): Promise<void>;
  delete(id: Uuid): Promise<void>;
}
