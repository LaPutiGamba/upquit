import Request from "../../domain/entities/Request.js";

export default interface RequestResponse {
  id: string;
  boardId: string;
  authorId: string;
  categoryIds: string[];
  title: string;
  description: string | null;
  status: string;
  voteCount: number | null;
  isPinned: boolean | null;
  isHidden: boolean | null;
  adminNote: string | null;
  createdAt: Date | null;
}

export function mapRequestToResponse(request: Request): RequestResponse {
  return {
    id: request.id.getValue(),
    boardId: request.boardId.getValue(),
    authorId: request.authorId.getValue(),
    categoryIds: request.categoryIds,
    title: request.title,
    description: request.description,
    status: request.status.getValue(),
    voteCount: request.voteCount,
    isPinned: request.isPinned,
    isHidden: request.isHidden,
    adminNote: request.adminNote,
    createdAt: request.createdAt
  };
}
