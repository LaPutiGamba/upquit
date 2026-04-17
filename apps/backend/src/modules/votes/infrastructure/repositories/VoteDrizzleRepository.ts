import { and, eq, sql } from "drizzle-orm";
import { votes } from "../schema.js";
import type { CurrentDatabase } from "../../../../shared/infrastructure/database/connection.js";

import VoteRepository from "../../domain/contracts/VoteRepository.js";
import Vote from "../../domain/entities/Vote.js";
import Uuid from "../../../../shared/domain/value-objects/Uuid.js";

export default class VoteDrizzleRepository implements VoteRepository {
  constructor(private readonly db: CurrentDatabase) {}

  public async findById(id: Uuid): Promise<Vote | null> {
    const [row] = await this.db.select().from(votes).where(eq(votes.id, id.getValue())).limit(1);

    if (!row) return null;
    return this.mapToDomainVote(row);
  }

  public async findByRequestAndUser(requestId: Uuid, userId: Uuid): Promise<Vote | null> {
    const [row] = await this.db
      .select()
      .from(votes)
      .where(and(eq(votes.requestId, requestId.getValue()), eq(votes.userId, userId.getValue())))
      .limit(1);

    if (!row) return null;
    return this.mapToDomainVote(row);
  }

  public async countByRequestId(requestId: Uuid): Promise<number> {
    const [row] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(votes)
      .where(eq(votes.requestId, requestId.getValue()));

    return Number(row?.count ?? 0);
  }

  public async save(vote: Vote): Promise<void> {
    await this.db.insert(votes).values({
      id: vote.id.getValue(),
      requestId: vote.requestId.getValue(),
      userId: vote.userId.getValue(),
      boardId: vote.boardId.getValue(),
      createdAt: vote.createdAt
    });
  }

  public async delete(id: Uuid): Promise<void> {
    await this.db.delete(votes).where(eq(votes.id, id.getValue()));
  }

  // =========================================================================
  // MAPPER
  // =========================================================================

  private mapToDomainVote(row: typeof votes.$inferSelect): Vote {
    return new Vote(row.id, row.requestId, row.userId, row.boardId, row.createdAt);
  }
}
