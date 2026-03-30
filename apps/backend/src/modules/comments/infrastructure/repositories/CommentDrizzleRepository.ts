import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { comments } from "../schema.js";

import CommentRepository from "../../domain/contracts/CommentRepository.js";
import Comment from "../../domain/entities/Comment.js";
import Uuid from "../../../../shared/domain/value-objects/Uuid.js";

export default class CommentDrizzleRepository implements CommentRepository {
  constructor(private readonly db: NodePgDatabase<Record<string, never>>) {}

  public async findById(id: Uuid): Promise<Comment | null> {
    const [row] = await this.db.select().from(comments).where(eq(comments.id, id.getValue())).limit(1);

    if (!row) return null;
    return this.mapToDomainComment(row);
  }

  public async findByRequestId(requestId: Uuid): Promise<Comment[]> {
    const rows = await this.db.select().from(comments).where(eq(comments.requestId, requestId.getValue()));
    return rows.map((row) => this.mapToDomainComment(row));
  }

  public async findByParentId(parentId: Uuid): Promise<Comment[]> {
    const rows = await this.db.select().from(comments).where(eq(comments.parentId, parentId.getValue()));
    return rows.map((row) => this.mapToDomainComment(row));
  }

  public async save(comment: Comment): Promise<void> {
    await this.db.insert(comments).values({
      id: comment.id.getValue(),
      requestId: comment.requestId.getValue(),
      userId: comment.userId.getValue(),
      parentId: comment.parentId?.getValue() ?? null,
      content: comment.content,
      isAdminReply: comment.isAdminReply,
      createdAt: comment.createdAt
    });
  }

  public async update(comment: Comment): Promise<void> {
    await this.db
      .update(comments)
      .set({
        requestId: comment.requestId.getValue(),
        userId: comment.userId.getValue(),
        parentId: comment.parentId?.getValue() ?? null,
        content: comment.content,
        isAdminReply: comment.isAdminReply
      })
      .where(eq(comments.id, comment.id.getValue()));
  }

  public async delete(id: Uuid): Promise<void> {
    await this.db.delete(comments).where(eq(comments.id, id.getValue()));
  }

  // =========================================================================
  // MAPPER
  // =========================================================================

  private mapToDomainComment(row: typeof comments.$inferSelect): Comment {
    return new Comment(row.id, row.requestId, row.userId, row.parentId, row.content, row.isAdminReply, row.createdAt);
  }
}
