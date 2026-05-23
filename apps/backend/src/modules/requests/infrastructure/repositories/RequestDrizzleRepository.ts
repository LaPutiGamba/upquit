import { and, asc, desc, eq, sql, not, inArray, ilike, or } from "drizzle-orm";
import {
  requestChangelogs,
  requests,
  subscriptions,
  requestCategories,
  requestChangelogDeletedCategories
} from "../schema.js";
import type { CurrentDatabase } from "../../../../shared/infrastructure/database/connection.js";

import RequestRepository, { FindByBoardIdFilters } from "../../domain/contracts/RequestRepository.js";
import type {
  RequestChangelogCreateInput,
  RequestChangelogWithAuthor
} from "../../domain/contracts/RequestChangelog.js";
import Request from "../../domain/entities/Request.js";
import Subscription from "../../domain/entities/Subscription.js";
import { type StatusValue } from "../../domain/value-objects/RequestStatus.js";
import User from "../../../users/domain/entities/User.js";
import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import { users } from "../../../users/infrastructure/schema.js";
import { boardMembers, boards, categories } from "../../../boards/infrastructure/schema.js";

export default class RequestDrizzleRepository implements RequestRepository {
  constructor(private readonly db: CurrentDatabase) {}

  // =========================================================================
  // REQUESTS
  // =========================================================================

  public async findById(id: Uuid): Promise<Request | null> {
    const [row] = await this.db
      .select({
        request: requests,
        author: users
      })
      .from(requests)
      .leftJoin(users, eq(requests.authorId, users.id))
      .where(eq(requests.id, id.getValue()))
      .limit(1);

    if (!row) {
      return null;
    }

    const categoryIds = await this.getRequestCategoryIds(id);
    if (!row.author) {
      return null;
    }

    const author = this.mapToDomainUser(row.author);

    return this.mapToDomainRequest(row.request, categoryIds, author);
  }

  public async findByBoardId(boardId: Uuid, filters?: FindByBoardIdFilters): Promise<Request[]> {
    const boardIdValue = boardId.getValue();

    let whereClause = eq(requests.boardId, boardIdValue);

    if (filters) {
      const conditions = [eq(requests.boardId, boardIdValue)];

      if (filters.status && filters.status.length > 0) {
        const statusValues = filters.status as Array<"open" | "planned" | "in_progress" | "completed" | "rejected">;
        conditions.push(inArray(requests.status, statusValues));
      }

      if (filters.categoryId) {
        const requestIdsWithCategory = await this.db
          .select({ requestId: requestCategories.requestId })
          .from(requestCategories)
          .where(eq(requestCategories.categoryId, filters.categoryId));

        if (requestIdsWithCategory.length > 0) {
          const ids = requestIdsWithCategory.map((r) => r.requestId);
          conditions.push(inArray(requests.id, ids));
        } else {
          return [];
        }
      }

      if (filters.search) {
        conditions.push(
          or(ilike(requests.title, `%${filters.search}%`), ilike(requests.description, `%${filters.search}%`))!
        );
      }

      if (filters.authorId) {
        conditions.push(eq(requests.authorId, filters.authorId));
      }

      if (filters.pinnedOnly) {
        conditions.push(eq(requests.isPinned, true));
      }

      if (filters.excludePinned) {
        conditions.push(not(eq(requests.isPinned, true)));
      }

      whereClause = and(...conditions)!;
    }

    let orderByClause = desc(requests.createdAt);

    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case "oldest":
          orderByClause = asc(requests.createdAt);
          break;
        case "recently_updated":
          orderByClause = desc(
            sql<Date>`coalesce((select max(created_at) from request_changelogs where request_id = ${requests.id}), ${requests.createdAt})`
          );
          break;
        case "newest":
        default:
          orderByClause = desc(requests.createdAt);
          break;
      }
    }

    const limit = filters?.limit ?? 100;
    const offset = filters?.offset ?? 0;

    const rows = await this.db
      .select({
        request: requests,
        author: users
      })
      .from(requests)
      .leftJoin(users, eq(requests.authorId, users.id))
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    if (rows.length === 0) {
      return [];
    }

    const requestIds = rows.map((row) => row.request.id);
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

    return rows
      .map((row) => {
        if (!row.author) {
          return null;
        }

        const author = this.mapToDomainUser(row.author);
        return this.mapToDomainRequest(row.request, requestCategoriesMap.get(row.request.id) ?? [], author);
      })
      .filter((request): request is Request => request !== null);
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
      authorId: request.author.id.getValue(),
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
        authorId: request.author.id.getValue(),
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

  public async delete(id: string): Promise<void> {
    await this.db.delete(requests).where(eq(requests.id, id));
  }

  public async addChangelogEntries(entries: RequestChangelogCreateInput[]): Promise<void> {
    if (entries.length === 0) {
      return;
    }

    await this.db.insert(requestChangelogs).values(
      entries.map((entry) => ({
        id: entry.id,
        requestId: entry.requestId,
        userId: entry.userId,
        field: entry.field,
        oldValue: entry.oldValue,
        newValue: entry.newValue
      }))
    );
  }

  public async findChangelogByRequestId(
    id: Uuid,
    filters?: { field?: string[]; userId?: string; search?: string; limit?: number; offset?: number }
  ): Promise<RequestChangelogWithAuthor[]> {
    const conditions = [eq(requestChangelogs.requestId, id.getValue())];

    if (filters?.field && filters.field.length > 0) {
      conditions.push(inArray(requestChangelogs.field, filters.field));
    }

    if (filters?.userId) {
      conditions.push(eq(requestChangelogs.userId, filters.userId));
    }

    if (filters?.search) {
      conditions.push(
        or(
          ilike(requestChangelogs.oldValue, `%${filters.search}%`),
          ilike(requestChangelogs.newValue, `%${filters.search}%`)
        )!
      );
    }

    const whereClause = and(...conditions)!;

    const limit = filters?.limit ?? 50;
    const offset = filters?.offset ?? 0;

    const rows = await this.db
      .select({
        changelog: requestChangelogs,
        userDisplayName: users.displayName
      })
      .from(requestChangelogs)
      .leftJoin(users, eq(requestChangelogs.userId, users.id))
      .where(whereClause)
      .orderBy(asc(requestChangelogs.createdAt), asc(requestChangelogs.id))
      .limit(limit)
      .offset(offset);

    const changelogEntries: RequestChangelogWithAuthor[] = rows.map((row) => ({
      id: row.changelog.id,
      requestId: row.changelog.requestId,
      userId: row.changelog.userId,
      userDisplayName: row.userDisplayName,
      field: row.changelog.field,
      oldValue: row.changelog.oldValue,
      newValue: row.changelog.newValue,
      createdAt: row.changelog.createdAt,
      deletedCategories: []
    }));

    // load deleted category names for the fetched changelog entries
    const changelogIds = changelogEntries.map((c) => c.id);
    if (changelogIds.length === 0) {
      return changelogEntries;
    }

    const deletedRows = await this.db
      .select({
        id: requestChangelogDeletedCategories.id,
        requestChangelogId: requestChangelogDeletedCategories.requestChangelogId,
        categoryId: requestChangelogDeletedCategories.categoryId,
        categoryName: requestChangelogDeletedCategories.categoryName
      })
      .from(requestChangelogDeletedCategories)
      .where(inArray(requestChangelogDeletedCategories.requestChangelogId, changelogIds));

    const mapByChangelog = new Map<string, { categoryId: string; categoryName: string }[]>();
    for (const dr of deletedRows) {
      const arr = mapByChangelog.get(dr.requestChangelogId) ?? [];
      arr.push({ categoryId: dr.categoryId, categoryName: dr.categoryName });
      mapByChangelog.set(dr.requestChangelogId, arr);
    }

    for (const entry of changelogEntries) {
      const arr = mapByChangelog.get(entry.id);
      if (arr) {
        entry.deletedCategories = arr;
      }
    }

    return changelogEntries;
  }

  public async getCategoryNamesByIds(categoryIds: string[]): Promise<{ id: string; name: string }[]> {
    if (categoryIds.length === 0) return [];

    const rows = await this.db
      .select({ id: categories.id, name: categories.name })
      .from(categories)
      .where(inArray(categories.id, categoryIds));

    return rows.map((r) => ({ id: r.id, name: r.name }));
  }

  public async addDeletedCategoriesForChangelog(
    records: { requestChangelogId: string; categoryId: string; categoryName: string }[]
  ): Promise<void> {
    if (records.length === 0) return;

    await this.db.insert(requestChangelogDeletedCategories).values(
      records.map((r) => ({
        requestChangelogId: r.requestChangelogId,
        categoryId: r.categoryId,
        categoryName: r.categoryName
      }))
    );
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

  public async removeUnusedCategories(categoryIds: string[]): Promise<string[]> {
    if (categoryIds.length === 0) {
      return [];
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
      return unusedCategoryIds;
    }

    return [];
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

  public async findSubscribersByRequestId(requestId: Uuid): Promise<string[]> {
    const rows = await this.db
      .select({ userId: subscriptions.userId })
      .from(subscriptions)
      .where(eq(subscriptions.requestId, requestId.getValue()));

    return rows.map((row) => row.userId);
  }

  // =========================================================================
  // MAPPER
  // =========================================================================

  private mapToDomainRequest(row: typeof requests.$inferSelect, categoryIds: string[] = [], author: User): Request {
    const statusValue = (row.status ?? "open") as StatusValue;

    return new Request(
      row.id,
      author,
      row.boardId,
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

  private mapToDomainUser(row: typeof users.$inferSelect): User {
    return new User(
      row.id,
      row.username,
      row.email,
      row.displayName,
      row.passwordHash,
      row.avatarUrl,
      row.emailVerified ?? false,
      row.oauthProvider,
      row.oauthId,
      row.isActive ?? true,
      row.createdAt
    );
  }
}
