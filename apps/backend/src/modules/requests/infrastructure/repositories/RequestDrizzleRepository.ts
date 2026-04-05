import { and, eq, sql } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { requests, subscriptions } from "../schema.js";

import RequestRepository from "../../domain/contracts/RequestRepository.js";
import Request from "../../domain/entities/Request.js";
import Subscription from "../../domain/entities/Subscription.js";
import { type StatusValue } from "../../domain/value-objects/RequestStatus.js";
import Uuid from "../../../../shared/domain/value-objects/Uuid.js";

export default class RequestDrizzleRepository implements RequestRepository {
  constructor(private readonly db: NodePgDatabase<Record<string, never>>) {}

  // =========================================================================
  // REQUESTS
  // =========================================================================

  public async findById(id: Uuid): Promise<Request | null> {
    const [row] = await this.db.select().from(requests).where(eq(requests.id, id.getValue())).limit(1);

    if (!row) return null;
    return this.mapToDomainRequest(row);
  }

  public async findByBoardId(boardId: Uuid): Promise<Request[]> {
    const rows = await this.db.select().from(requests).where(eq(requests.boardId, boardId.getValue()));
    return rows.map((row) => this.mapToDomainRequest(row));
  }

  public async save(request: Request): Promise<void> {
    await this.db.insert(requests).values({
      id: request.id.getValue(),
      boardId: request.boardId.getValue(),
      authorId: request.authorId.getValue(),
      categoryId: request.categoryId?.getValue() ?? null,
      title: request.title,
      description: request.description,
      status: request.status.getValue(),
      voteCount: request.voteCount,
      isPinned: request.isPinned,
      isHidden: request.isHidden,
      adminNote: request.adminNote,
      createdAt: request.createdAt
    });
  }

  public async update(request: Request): Promise<void> {
    await this.db
      .update(requests)
      .set({
        boardId: request.boardId.getValue(),
        authorId: request.authorId.getValue(),
        categoryId: request.categoryId?.getValue() ?? null,
        title: request.title,
        description: request.description,
        status: request.status.getValue(),
        voteCount: request.voteCount,
        isPinned: request.isPinned,
        isHidden: request.isHidden,
        adminNote: request.adminNote
      })
      .where(eq(requests.id, request.id.getValue()));
  }

  public async incrementVoteCount(id: Uuid): Promise<void> {
    await this.db
      .update(requests)
      .set({
        voteCount: sql`${requests.voteCount} + 1`
      })
      .where(eq(requests.id, id.getValue()));
  }

  public async decrementVoteCount(id: Uuid): Promise<void> {
    await this.db
      .update(requests)
      .set({
        voteCount: sql`${requests.voteCount} - 1`
      })
      .where(eq(requests.id, id.getValue()));
  }

  // =========================================================================
  // SUBSCRIPTIONS
  // =========================================================================

  public async addSubscription(subscription: Subscription): Promise<void> {
    await this.db.insert(subscriptions).values({
      userId: subscription.userId.getValue(),
      requestId: subscription.requestId.getValue(),
      createdAt: subscription.createdAt
    });
  }

  public async removeSubscription(userId: Uuid, requestId: Uuid): Promise<void> {
    await this.db
      .delete(subscriptions)
      .where(and(eq(subscriptions.userId, userId.getValue()), eq(subscriptions.requestId, requestId.getValue())));
  }

  public async isSubscribed(userId: Uuid, requestId: Uuid): Promise<boolean> {
    const [row] = await this.db
      .select()
      .from(subscriptions)
      .where(and(eq(subscriptions.userId, userId.getValue()), eq(subscriptions.requestId, requestId.getValue())))
      .limit(1);

    return !!row;
  }

  // =========================================================================
  // MAPPER
  // =========================================================================

  private mapToDomainRequest(row: typeof requests.$inferSelect): Request {
    const statusValue = (row.status ?? "open") as StatusValue;

    return new Request(
      row.id,
      row.boardId,
      row.authorId,
      row.categoryId,
      row.title,
      row.description,
      statusValue,
      row.voteCount,
      row.isPinned,
      row.isHidden,
      row.adminNote,
      row.createdAt
    );
  }
}
