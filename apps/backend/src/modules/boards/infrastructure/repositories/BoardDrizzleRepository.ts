import { and, eq, inArray } from "drizzle-orm";
import { boards, boardMembers, categories } from "../schema.js";
import { users } from "../../../users/infrastructure/schema.js";
import type { CurrentDatabase } from "../../../../shared/infrastructure/database/connection.js";

import BoardRepository, { type BoardMemberRecord } from "../../domain/contracts/BoardRepository.js";
import Board from "../../domain/entities/Board.js";
import BoardMember from "../../domain/entities/BoardMember.js";
import Category from "../../domain/entities/Category.js";
import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import Slug from "../../domain/value-objects/Slug.js";

export default class BoardDrizzleRepository implements BoardRepository {
  constructor(private readonly db: CurrentDatabase) {}

  // =========================================================================
  // BOARDS
  // =========================================================================

  public async findById(id: Uuid): Promise<Board | null> {
    const [row] = await this.db.select().from(boards).where(eq(boards.id, id.getValue())).limit(1);

    if (!row) return null;
    return this.mapToDomainBoard(row);
  }

  public async findBySlug(slug: Slug): Promise<Board | null> {
    const [row] = await this.db.select().from(boards).where(eq(boards.slug, slug.getValue())).limit(1);

    if (!row) return null;
    return this.mapToDomainBoard(row);
  }

  public async findByUserId(userId: Uuid): Promise<Board[]> {
    const boardIds = await this.findBoardIdsByUserId(userId);

    if (boardIds.length === 0) {
      return [];
    }

    const rows = await this.db.select().from(boards).where(inArray(boards.id, boardIds));
    return rows.map((row) => this.mapToDomainBoard(row));
  }

  public async findBoardIdsByUserId(userId: Uuid): Promise<string[]> {
    const memberRows = await this.db
      .select({ boardId: boardMembers.boardId })
      .from(boardMembers)
      .innerJoin(users, eq(users.id, boardMembers.userId))
      .where(and(eq(boardMembers.userId, userId.getValue()), eq(users.isActive, true)));

    const ownedRows = await this.db
      .select({ boardId: boards.id })
      .from(boards)
      .where(eq(boards.ownerId, userId.getValue()));

    return [...new Set([...memberRows, ...ownedRows].map((row) => row.boardId))];
  }

  public async hasTenantAccess(userId: string, tenantId: string): Promise<boolean> {
    const [ownedBoard] = await this.db
      .select({ boardId: boards.id })
      .from(boards)
      .where(and(eq(boards.id, tenantId), eq(boards.ownerId, userId)))
      .limit(1);

    if (ownedBoard) {
      return true;
    }

    const [memberBoard] = await this.db
      .select({ boardId: boardMembers.boardId })
      .from(boardMembers)
      .where(and(eq(boardMembers.boardId, tenantId), eq(boardMembers.userId, userId)))
      .limit(1);

    return Boolean(memberBoard);
  }

  public async save(board: Board): Promise<void> {
    await this.db.insert(boards).values({
      id: board.id.getValue(),
      slug: board.slug.getValue(),
      name: board.name,
      description: board.description,
      logoUrl: board.logoUrl,
      primaryColor: board.primaryColor?.getValue() ?? null,
      ownerId: board.ownerId.getValue(),
      isPublic: board.isPublic,
      allowAnonymousVotes: board.allowAnonymousVotes,
      giveToGetEnabled: board.giveToGetEnabled,
      giveToGetVotesReq: board.giveToGetVotesReq,
      giveToGetCommentsReq: board.giveToGetCommentsReq,
      createdAt: board.createdAt
    });
  }

  public async update(board: Board): Promise<void> {
    await this.db
      .update(boards)
      .set({
        slug: board.slug.getValue(),
        name: board.name,
        description: board.description,
        logoUrl: board.logoUrl,
        primaryColor: board.primaryColor?.getValue() ?? null,
        ownerId: board.ownerId.getValue(),
        isPublic: board.isPublic,
        allowAnonymousVotes: board.allowAnonymousVotes,
        giveToGetEnabled: board.giveToGetEnabled,
        giveToGetVotesReq: board.giveToGetVotesReq,
        giveToGetCommentsReq: board.giveToGetCommentsReq
      })
      .where(eq(boards.id, board.id.getValue()));
  }

  // =========================================================================
  // BOARD MEMBERS
  // =========================================================================

  public async addMember(member: BoardMember): Promise<void> {
    await this.db.insert(boardMembers).values({
      userId: member.userId.getValue(),
      boardId: member.boardId.getValue(),
      role: member.role,
      createdAt: member.createdAt
    });
  }

  public async findMembersByBoardId(boardId: Uuid): Promise<BoardMemberRecord[]> {
    return await this.db
      .select({
        userId: boardMembers.userId,
        boardId: boardMembers.boardId,
        email: users.email,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        role: boardMembers.role,
        createdAt: boardMembers.createdAt
      })
      .from(boardMembers)
      .innerJoin(users, eq(users.id, boardMembers.userId))
      .where(eq(boardMembers.boardId, boardId.getValue()));
  }

  public async findMemberByBoardIdAndUserId(boardId: Uuid, userId: Uuid): Promise<BoardMemberRecord | null> {
    const [row] = await this.db
      .select({
        userId: boardMembers.userId,
        boardId: boardMembers.boardId,
        email: users.email,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        role: boardMembers.role,
        createdAt: boardMembers.createdAt
      })
      .from(boardMembers)
      .innerJoin(users, eq(users.id, boardMembers.userId))
      .where(and(eq(boardMembers.boardId, boardId.getValue()), eq(boardMembers.userId, userId.getValue())))
      .limit(1);

    return row ?? null;
  }

  public async updateMemberRole(boardId: Uuid, userId: Uuid, role: string): Promise<void> {
    await this.db
      .update(boardMembers)
      .set({ role })
      .where(and(eq(boardMembers.boardId, boardId.getValue()), eq(boardMembers.userId, userId.getValue())));
  }

  public async removeMember(boardId: Uuid, userId: Uuid): Promise<void> {
    await this.db
      .delete(boardMembers)
      .where(and(eq(boardMembers.boardId, boardId.getValue()), eq(boardMembers.userId, userId.getValue())));
  }

  // =========================================================================
  // CATEGORIES
  // =========================================================================

  public async addCategory(category: Category): Promise<void> {
    await this.db.insert(categories).values({
      id: category.id.getValue(),
      boardId: category.boardId.getValue(),
      name: category.name,
      createdAt: category.createdAt
    });
  }

  public async findCategoriesByBoardId(boardId: Uuid): Promise<Category[]> {
    const rows = await this.db.select().from(categories).where(eq(categories.boardId, boardId.getValue()));

    return rows.map((row) => new Category(row.id, row.boardId, row.name, row.createdAt));
  }

  // =========================================================================
  // MAPPER
  // =========================================================================

  private mapToDomainBoard(row: typeof boards.$inferSelect): Board {
    return new Board(
      row.id,
      row.slug,
      row.name,
      row.description,
      row.logoUrl,
      row.primaryColor,
      row.ownerId,
      row.isPublic,
      row.allowAnonymousVotes,
      row.giveToGetEnabled,
      row.giveToGetVotesReq,
      row.giveToGetCommentsReq,
      row.createdAt
    );
  }
}
