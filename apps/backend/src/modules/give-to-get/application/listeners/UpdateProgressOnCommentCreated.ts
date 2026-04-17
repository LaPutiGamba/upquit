import CommentCreatedEvent from "../../../comments/domain/events/CommentCreatedEvent.js";
import GiveToGetProgressRepository from "../../domain/contracts/GiveToGetProgressRepository.js";
import BoardRepository from "../../../boards/domain/contracts/BoardRepository.js";
import RequestRepository from "../../../requests/domain/contracts/RequestRepository.js";
import GiveToGetProgress from "../../domain/entities/GiveToGetProgress.js";
import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import RealtimePublisher from "../../../../shared/domain/contracts/RealtimePublisher.js";
import { mapGiveToGetProgressToResponse } from "../responses/GiveToGetProgressResponse.js";

export default class UpdateProgressOnCommentCreated {
  constructor(
    private readonly progressRepository: GiveToGetProgressRepository,
    private readonly requestRepository: RequestRepository,
    private readonly boardRepository: BoardRepository,
    private readonly realtimePublisher: RealtimePublisher
  ) {}

  async handle(event: CommentCreatedEvent): Promise<void> {
    if (event.isAdminReply || event.parentId !== null) {
      return;
    }

    const requestId = new Uuid(event.requestId);
    const userId = new Uuid(event.userId);

    const request = await this.requestRepository.findById(requestId);
    if (!request) {
      return;
    }

    const boardId = request.boardId;
    const board = await this.boardRepository.findById(boardId);
    if (!board || !board.giveToGetEnabled) {
      return;
    }

    let currentProgress = await this.progressRepository.findByUserAndBoard(userId, boardId);

    if (!currentProgress) {
      const newProgressId = crypto.randomUUID();
      currentProgress = new GiveToGetProgress(newProgressId, event.userId, boardId.getValue(), 0, 1, false, null);
      await this.progressRepository.save(currentProgress);
    } else {
      currentProgress = await this.progressRepository.incrementQualifyingComments(userId, boardId);
    }

    let finalProgressToPublish = currentProgress;

    if (currentProgress && !currentProgress.canPost) {
      const reqVotes = board.giveToGetVotesReq ?? 0;
      const reqComments = board.giveToGetCommentsReq ?? 0;

      const currentVotes = currentProgress.votesGiven ?? 0;
      const currentComments = currentProgress.qualifyingComments ?? 0;

      if (currentVotes >= reqVotes && currentComments >= reqComments) {
        const unlockedProgress = new GiveToGetProgress(
          currentProgress.id.getValue(),
          currentProgress.userId.getValue(),
          currentProgress.boardId.getValue(),
          currentProgress.votesGiven,
          currentProgress.qualifyingComments,
          true,
          new Date()
        );

        await this.progressRepository.update(unlockedProgress);
        finalProgressToPublish = unlockedProgress;
      }
    }

    if (finalProgressToPublish) {
      this.realtimePublisher.publish(
        `progress.${userId.getValue()}.${boardId.getValue()}`,
        "ProgressUpdated",
        mapGiveToGetProgressToResponse(finalProgressToPublish)
      );
    }
  }
}
