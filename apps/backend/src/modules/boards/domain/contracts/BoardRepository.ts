import Board from "../entities/Board.js";
import BoardMember from "../entities/BoardMember.js";
import Category from "../entities/Category.js";
import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import Slug from "../value-objects/Slug.js";

export default interface BoardRepository {
  // Board Operations
  findById(id: Uuid): Promise<Board | null>;
  findBySlug(slug: Slug): Promise<Board | null>;
  findBoardIdsByUserId(userId: Uuid): Promise<string[]>;
  save(board: Board): Promise<void>;
  update(board: Board): Promise<void>;

  // Member Operations
  addMember(member: BoardMember): Promise<void>;
  findMembersByBoardId(boardId: Uuid): Promise<BoardMember[]>;

  // Category Operations
  addCategory(category: Category): Promise<void>;
  findCategoriesByBoardId(boardId: Uuid): Promise<Category[]>;
}
