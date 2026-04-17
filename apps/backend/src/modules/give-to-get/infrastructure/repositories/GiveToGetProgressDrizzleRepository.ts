import { and, eq, sql } from "drizzle-orm";
import { giveToGetProgress } from "../schema.js";
import type { CurrentDatabase } from "../../../../shared/infrastructure/database/connection.js";

import GiveToGetProgressRepository from "../../domain/contracts/GiveToGetProgressRepository.js";
import GiveToGetProgress from "../../domain/entities/GiveToGetProgress.js";
import Uuid from "../../../../shared/domain/value-objects/Uuid.js";

export default class GiveToGetProgressDrizzleRepository implements GiveToGetProgressRepository {
  constructor(private readonly db: CurrentDatabase) {}

  public async findById(id: Uuid): Promise<GiveToGetProgress | null> {
    const [row] = await this.db
      .select()
      .from(giveToGetProgress)
      .where(eq(giveToGetProgress.id, id.getValue()))
      .limit(1);

    if (!row) return null;
    return this.mapToDomainProgress(row);
  }

  public async findByUserAndBoard(userId: Uuid, boardId: Uuid): Promise<GiveToGetProgress | null> {
    const [row] = await this.db
      .select()
      .from(giveToGetProgress)
      .where(and(eq(giveToGetProgress.userId, userId.getValue()), eq(giveToGetProgress.boardId, boardId.getValue())))
      .limit(1);

    if (!row) return null;
    return this.mapToDomainProgress(row);
  }

  public async save(progress: GiveToGetProgress): Promise<void> {
    await this.db.insert(giveToGetProgress).values({
      id: progress.id.getValue(),
      userId: progress.userId.getValue(),
      boardId: progress.boardId.getValue(),
      votesGiven: progress.votesGiven,
      qualifyingComments: progress.qualifyingComments,
      canPost: progress.canPost,
      unlockedAt: progress.unlockedAt
    });
  }

  public async update(progress: GiveToGetProgress): Promise<void> {
    await this.db
      .update(giveToGetProgress)
      .set({
        userId: progress.userId.getValue(),
        boardId: progress.boardId.getValue(),
        votesGiven: progress.votesGiven,
        qualifyingComments: progress.qualifyingComments,
        canPost: progress.canPost,
        unlockedAt: progress.unlockedAt
      })
      .where(eq(giveToGetProgress.id, progress.id.getValue()));
  }

  public async incrementVotesGiven(userId: Uuid, boardId: Uuid): Promise<void> {
    await this.db
      .update(giveToGetProgress)
      .set({
        votesGiven: sql`${giveToGetProgress.votesGiven} + 1`
      })
      .where(and(eq(giveToGetProgress.userId, userId.getValue()), eq(giveToGetProgress.boardId, boardId.getValue())));
  }

  public async decrementVotesGiven(userId: Uuid, boardId: Uuid): Promise<void> {
    await this.db
      .update(giveToGetProgress)
      .set({
        votesGiven: sql`${giveToGetProgress.votesGiven} - 1`
      })
      .where(and(eq(giveToGetProgress.userId, userId.getValue()), eq(giveToGetProgress.boardId, boardId.getValue())));
  }

  public async incrementQualifyingComments(userId: Uuid, boardId: Uuid): Promise<void> {
    await this.db
      .update(giveToGetProgress)
      .set({
        qualifyingComments: sql`${giveToGetProgress.qualifyingComments} + 1`
      })
      .where(and(eq(giveToGetProgress.userId, userId.getValue()), eq(giveToGetProgress.boardId, boardId.getValue())));
  }

  public async decrementQualifyingComments(userId: Uuid, boardId: Uuid): Promise<void> {
    await this.db
      .update(giveToGetProgress)
      .set({
        qualifyingComments: sql`${giveToGetProgress.qualifyingComments} - 1`
      })
      .where(and(eq(giveToGetProgress.userId, userId.getValue()), eq(giveToGetProgress.boardId, boardId.getValue())));
  }

  // =========================================================================
  // MAPPER
  // =========================================================================

  private mapToDomainProgress(row: typeof giveToGetProgress.$inferSelect): GiveToGetProgress {
    return new GiveToGetProgress(
      row.id,
      row.userId,
      row.boardId,
      row.votesGiven,
      row.qualifyingComments,
      row.canPost,
      row.unlockedAt
    );
  }
}
