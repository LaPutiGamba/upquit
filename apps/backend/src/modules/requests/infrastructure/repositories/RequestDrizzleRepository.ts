import { and, asc, eq, sql, not, inArray } from "drizzle-orm";
import { requestChangelogs, requests, subscriptions, requestCategories } from "../schema.js";
import type { CurrentDatabase } from "../../../../shared/infrastructure/database/connection.js";

import RequestRepository from "../../domain/contracts/RequestRepository.js";
import type {
  RequestChangelogCreateInput,
  RequestChangelogWithAuthor
} from "../../domain/contracts/RequestChangelog.js";
import Request from "../../domain/entities/Request.js";
import Subscription from "../../domain/entities/Subscription.js";
import { type StatusValue } from "../../domain/value-objects/RequestStatus.js";
import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import { users } from "../../../users/infrastructure/schema.js";
import { boardMembers, boards, categories } from "../../../boards/infrastructure/schema.js";

export default class RequestDrizzleRepository implements RequestRepository {
  constructor(private readonly db: CurrentDatabase) {}

  // =========================================================================
  // REQUESTS
  // =========================================================================

  public async findById(id: Uuid): Promise<Request | null> {
    const [row] = await this.db.select().from(requests).where(eq(requests.id, id.getValue())).limit(1);

    if (!row) return null;

    const categoryIds = await this.getRequestCategoryIds(id);
    return this.mapToDomainRequest(row, categoryIds);
  }

  public async findByBoardId(boardId: Uuid): Promise<Request[]> {
    const rows = await this.db.select().from(requests).where(eq(requests.boardId, boardId.getValue()));

    if (rows.length === 0) {
      return [];
    }

    const requestIds = rows.map((row) => row.id);
    const categoryRows = await this.db
      .select({ requestId: requestCategories.requestId, categoryId: requestCategories.categoryId })
      .from(requestCategories)
      .where(inArray(requestCategories.requestId, requestIds));

    const requestCategoriesMap = new Map<string, string[]>();
    for (const requestId of requestIds) {
      requestCategoriesMap.set(requestId, []);
    }

    for (const categoryRow of categoryRows) {
      const currentCategoryIds = requestCategoriesMap.get(categoryRow.requestId);
      if (currentCategoryIds) {
        currentCategoryIds.push(categoryRow.categoryId);
      }
    }

    return rows.map((row) => this.mapToDomainRequest(row, requestCategoriesMap.get(row.id) ?? []));
  }

  public async isBoardOwnerOrAdmin(boardId: Uuid, userId: Uuid): Promise<boolean> {
    const boardIdValue = boardId.getValue();
    const userIdValue = userId.getValue();

    const [ownedBoard] = await this.db
      .select({ boardId: boards.id })
      .from(boards)
      .where(and(eq(boards.id, boardIdValue), eq(boards.ownerId, userIdValue)))
      .limit(1);

    if (ownedBoard) {
      return true;
    }

    const [adminMembership] = await this.db
      .select({ boardId: boardMembers.boardId })
      .from(boardMembers)
      .where(
        and(
          eq(boardMembers.boardId, boardIdValue),
          eq(boardMembers.userId, userIdValue),
          eq(boardMembers.role, "admin")
        )
      )
      .limit(1);

    return Boolean(adminMembership);
  }

  public async save(request: Request): Promise<void> {
    await this.db.insert(requests).values({
      id: request.id.getValue(),
      boardId: request.boardId.getValue(),
      authorId: request.authorId.getValue(),
      title: request.title,
      description: request.description,
      status: request.status.getValue(),
      voteCount: request.voteCount,
      isPinned: request.isPinned,
      isHidden: request.isHidden,
      adminNote: request.adminNote,
      createdAt: request.createdAt
    });

    if (request.categoryIds.length > 0) {
      await this.db.insert(requestCategories).values(
        request.categoryIds.map((categoryId) => ({
          requestId: request.id.getValue(),
          categoryId
        }))
      );
    }
  }

  public async update(request: Request): Promise<void> {
    await this.db
      .update(requests)
      .set({
        boardId: request.boardId.getValue(),
        authorId: request.authorId.getValue(),
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

  public async addChangelogEntries(entries: RequestChangelogCreateInput[]): Promise<void> {
    if (entries.length === 0) {
      return;
    }

    await this.db.insert(requestChangelogs).values(
      entries.map((entry) => ({
        requestId: entry.requestId,
        userId: entry.userId,
        field: entry.field,
        oldValue: entry.oldValue,
        newValue: entry.newValue
      }))
    );
  }

  public async findChangelogByRequestId(id: Uuid): Promise<RequestChangelogWithAuthor[]> {
    const rows = await this.db
      .select({
        changelog: requestChangelogs,
        userDisplayName: users.displayName
      })
      .from(requestChangelogs)
      .leftJoin(users, eq(requestChangelogs.userId, users.id))
      .where(eq(requestChangelogs.requestId, id.getValue()))
      .orderBy(asc(requestChangelogs.createdAt), asc(requestChangelogs.id));

    return rows.map((row) => ({
      id: row.changelog.id,
      requestId: row.changelog.requestId,
      userId: row.changelog.userId,
      userDisplayName: row.userDisplayName,
      field: row.changelog.field,
      oldValue: row.changelog.oldValue,
      newValue: row.changelog.newValue,
      createdAt: row.changelog.createdAt
    }));
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
  // REQUEST CATEGORIES
  // =========================================================================

  public async setRequestCategories(requestId: Uuid, categoryIds: string[]): Promise<void> {
    const requestIdValue = requestId.getValue();

    await this.db.delete(requestCategories).where(eq(requestCategories.requestId, requestIdValue));

    if (categoryIds.length > 0) {
      await this.db.insert(requestCategories).values(
        categoryIds.map((categoryId) => ({
          requestId: requestIdValue,
          categoryId
        }))
      );
    }
  }

  public async getRequestCategoryIds(requestId: Uuid): Promise<string[]> {
    const rows = await this.db
      .select({ categoryId: requestCategories.categoryId })
      .from(requestCategories)
      .where(eq(requestCategories.requestId, requestId.getValue()));

    return rows.map((row) => row.categoryId);
  }

  public async removeUnusedCategories(categoryIds: string[]): Promise<void> {
    if (categoryIds.length === 0) {
      return;
    }

    const unusedCategories = await this.db
      .select({ id: categories.id })
      .from(categories)
      .where(
        and(
          inArray(categories.id, categoryIds),
          not(
            sql`EXISTS (
              SELECT 1 FROM ${requestCategories}
              WHERE ${requestCategories.categoryId} = ${categories.id}
            )`
          )
        )
      );

    if (unusedCategories.length > 0) {
      const unusedCategoryIds = unusedCategories.map((cat) => cat.id);
      await this.db.delete(categories).where(inArray(categories.id, unusedCategoryIds));
    }
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

  private mapToDomainRequest(row: typeof requests.$inferSelect, categoryIds: string[] = []): Request {
    const statusValue = (row.status ?? "open") as StatusValue;

    return new Request(
      row.id,
      row.boardId,
      row.authorId,
      categoryIds,
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
