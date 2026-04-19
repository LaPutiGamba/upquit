import Board from "../entities/Board.js";
import BoardMember from "../entities/BoardMember.js";
import Category from "../entities/Category.js";
import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import Slug from "../value-objects/Slug.js";

export interface BoardMemberRecord {
  userId: string;
  boardId: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  role: string;
  createdAt: Date | null;
}

export default interface BoardRepository {
  // Board Operations
  hasTenantAccess(userId: string, tenantId: string): Promise<boolean>;
  findById(id: Uuid): Promise<Board | null>;
  findBySlug(slug: Slug): Promise<Board | null>;
  findByUserId(userId: Uuid): Promise<Board[]>;
  findBoardIdsByUserId(userId: Uuid): Promise<string[]>;
  save(board: Board): Promise<void>;
  update(board: Board): Promise<void>;

  // Member Operations
  addMember(member: BoardMember): Promise<void>;
  findMembersByBoardId(boardId: Uuid): Promise<BoardMemberRecord[]>;
  findMemberByBoardIdAndUserId(boardId: Uuid, userId: Uuid): Promise<BoardMemberRecord | null>;
  updateMemberRole(boardId: Uuid, userId: Uuid, role: string): Promise<void>;
  removeMember(boardId: Uuid, userId: Uuid): Promise<void>;

  // Category Operations
  addCategory(category: Category): Promise<void>;
  findCategoriesByBoardId(boardId: Uuid): Promise<Category[]>;
}
