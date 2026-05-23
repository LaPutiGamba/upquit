import Board from "../entities/Board.js";
import BoardMember from "../entities/BoardMember.js";
import Category from "../entities/Category.js";
import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import Slug from "../value-objects/Slug.js";
import type { BoardMemberRole } from "../../application/queries/GetBoardMembersByBoardIdQuery.js";
import type { BoardsByUserSortBy } from "../../application/queries/GetBoardsByUserIdQuery.js";

export type PublicBoardSortBy = "recent" | "name" | "members";

export interface BoardMemberRecord {
  userId: string;
  boardId: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  role: string;
  createdAt: Date | null;
}

export interface FindMembersFilters {
  role?: BoardMemberRole;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface FindBoardsByUserFilters {
  search?: string;
  sortBy?: BoardsByUserSortBy;
  limit?: number;
  offset?: number;
}

export default interface BoardRepository {
  // Board Operations
  hasTenantAccess(userId: string, tenantId: string): Promise<boolean>;
  findById(id: Uuid): Promise<Board | null>;
  findBySlug(slug: Slug): Promise<Board | null>;
  findByUserId(userId: Uuid, filters?: FindBoardsByUserFilters): Promise<Board[]>;
  findByOwnerId(ownerId: Uuid): Promise<Board[]>;
  searchPublicBoards(searchTerm: string, sortBy: PublicBoardSortBy, limit: number, offset: number): Promise<Board[]>;
  findBoardIdsByUserId(userId: Uuid): Promise<string[]>;
  save(board: Board): Promise<void>;
  update(board: Board): Promise<void>;
  delete(id: string): Promise<void>;

  // Member Operations
  addMember(member: BoardMember): Promise<void>;
  findMembersByBoardId(boardId: Uuid, filters?: FindMembersFilters): Promise<BoardMemberRecord[]>;
  findMemberByBoardIdAndUserId(boardId: Uuid, userId: Uuid): Promise<BoardMemberRecord | null>;
  updateMemberRole(boardId: Uuid, userId: Uuid, role: string): Promise<void>;
  removeMember(boardId: Uuid, userId: Uuid): Promise<void>;

  // Category Operations
  addCategory(category: Category): Promise<void>;
  findCategoriesByBoardId(boardId: Uuid): Promise<Category[]>;
}
