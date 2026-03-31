import Category from "../../domain/entities/Category.js";

export default interface CategoryResponse {
  id: string;
  boardId: string;
  name: string;
  createdAt: Date | null;
}

export function mapCategoryToResponse(category: Category): CategoryResponse {
  return {
    id: category.id.getValue(),
    boardId: category.boardId.getValue(),
    name: category.name,
    createdAt: category.createdAt
  };
}
