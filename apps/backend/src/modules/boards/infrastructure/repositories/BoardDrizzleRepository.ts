import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { boards, boardMembers, categories } from "../schema.js";

import BoardRepository from "../../domain/contracts/BoardRepository.js";
import Board from "../../domain/entities/Board.js";
import BoardMember from "../../domain/entities/BoardMember.js";
import Category from "../../domain/entities/Category.js";
import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import Slug from "../../domain/value-objects/Slug.js";
import HexColor from "../../domain/value-objects/HexColor.js";

export default class BoardDrizzleRepository implements BoardRepository {
  constructor(private readonly db: NodePgDatabase<Record<string, never>>) {}

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

  public async findMembersByBoardId(boardId: Uuid): Promise<BoardMember[]> {
    const rows = await this.db.select().from(boardMembers).where(eq(boardMembers.boardId, boardId.getValue()));

    return rows.map((row) => new BoardMember(new Uuid(row.userId), new Uuid(row.boardId), row.role, row.createdAt));
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

    return rows.map((row) => new Category(new Uuid(row.id), new Uuid(row.boardId), row.name, row.createdAt));
  }

  // =========================================================================
  // MAPPER
  // =========================================================================

  private mapToDomainBoard(row: typeof boards.$inferSelect): Board {
    return new Board(
      new Uuid(row.id),
      new Slug(row.slug),
      row.name,
      row.description,
      row.logoUrl,
      row.primaryColor ? new HexColor(row.primaryColor) : null,
      new Uuid(row.ownerId),
      row.isPublic,
      row.allowAnonymousVotes,
      row.giveToGetEnabled,
      row.giveToGetVotesReq,
      row.giveToGetCommentsReq,
      row.createdAt
    );
  }
}
