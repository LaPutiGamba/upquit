import GiveToGetProgress from "../../domain/entities/GiveToGetProgress.js";

export default interface GiveToGetProgressResponse {
  id: string;
  userId: string;
  boardId: string;
  votesGiven: number | null;
  qualifyingComments: number | null;
  canPost: boolean | null;
  unlockedAt: Date | null;
}

export function mapGiveToGetProgressToResponse(progress: GiveToGetProgress): GiveToGetProgressResponse {
  return {
    id: progress.id.getValue(),
    userId: progress.userId.getValue(),
    boardId: progress.boardId.getValue(),
    votesGiven: progress.votesGiven,
    qualifyingComments: progress.qualifyingComments,
    canPost: progress.canPost,
    unlockedAt: progress.unlockedAt
  };
}
