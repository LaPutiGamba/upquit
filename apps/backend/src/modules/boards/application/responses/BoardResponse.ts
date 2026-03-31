import Board from "../../domain/entities/Board.js";

export default interface BoardResponse {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  ownerId: string;
  isPublic: boolean | null;
  allowAnonymousVotes: boolean | null;
  giveToGetEnabled: boolean | null;
  giveToGetVotesReq: number | null;
  giveToGetCommentsReq: number | null;
  createdAt: Date | null;
}

export function mapBoardToResponse(board: Board): BoardResponse {
  return {
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
  };
}
