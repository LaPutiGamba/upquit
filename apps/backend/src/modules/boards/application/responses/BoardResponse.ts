import Board from "../../domain/entities/Board.js";

export default interface BoardResponse {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  ownerId: string;
  ownerDisplayName: string | null;
  ownerAvatarUrl: string | null;
  ownerUsername: string | null;
  ownerIsActive: boolean | null;
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
    ownerDisplayName: board.owner?.displayName ?? null,
    ownerAvatarUrl: board.owner?.avatarUrl ?? null,
    ownerUsername: board.owner?.username ?? null,
    ownerIsActive: board.owner?.isActive ?? null,
    isPublic: board.isPublic,
    allowAnonymousVotes: board.allowAnonymousVotes,
    giveToGetEnabled: board.giveToGetEnabled,
    giveToGetVotesReq: board.giveToGetVotesReq,
    giveToGetCommentsReq: board.giveToGetCommentsReq,
    createdAt: board.createdAt
  };
}
