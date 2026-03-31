import Vote from "../../domain/entities/Vote.js";

export default interface VoteResponse {
  id: string;
  requestId: string;
  userId: string;
  boardId: string;
  createdAt: Date | null;
}

export function mapVoteToResponse(vote: Vote): VoteResponse {
  return {
    id: vote.id.getValue(),
    requestId: vote.requestId.getValue(),
    userId: vote.userId.getValue(),
    boardId: vote.boardId.getValue(),
    createdAt: vote.createdAt
  };
}
