import VoteDeletedEvent from "../../../votes/domain/events/VoteDeletedEvent.js";
import GiveToGetProgressRepository from "../../domain/contracts/GiveToGetProgressRepository.js";
import BoardRepository from "../../../boards/domain/contracts/BoardRepository.js";
import GiveToGetProgress from "../../domain/entities/GiveToGetProgress.js";
import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import RealtimePublisher from "../../../../shared/domain/contracts/RealtimePublisher.js";
import { mapGiveToGetProgressToResponse } from "../responses/GiveToGetProgressResponse.js";

export default class RevertProgressOnVoteDeleted {
  constructor(
    private readonly progressRepository: GiveToGetProgressRepository,
    private readonly boardRepository: BoardRepository,
    private readonly realtimePublisher: RealtimePublisher
  ) {}

  async handle(event: VoteDeletedEvent): Promise<void> {
    const userId = new Uuid(event.userId);
    const boardId = new Uuid(event.boardId);

    const board = await this.boardRepository.findById(boardId);
    if (!board || !board.giveToGetEnabled) return;

    await this.progressRepository.decrementVotesGiven(userId, boardId);

    const currentProgress = await this.progressRepository.findByUserAndBoard(userId, boardId);
    if (!currentProgress) return;

    let finalProgressToPublish = currentProgress;

    if (currentProgress.canPost) {
      const reqVotes = board.giveToGetVotesReq ?? 0;
      const reqComments = board.giveToGetCommentsReq ?? 0;

      const currentVotes = currentProgress.votesGiven ?? 0;
      const currentComments = currentProgress.qualifyingComments ?? 0;

      if (currentVotes < reqVotes || currentComments < reqComments) {
        const lockedProgress = new GiveToGetProgress(
          currentProgress.id.getValue(),
          currentProgress.userId.getValue(),
          currentProgress.boardId.getValue(),
          currentProgress.votesGiven,
          currentProgress.qualifyingComments,
          false,
          null
        );

        await this.progressRepository.update(lockedProgress);
        finalProgressToPublish = lockedProgress;
      }
    }

    this.realtimePublisher.publish(
      `progress.${userId.getValue()}.${boardId.getValue()}`,
      "ProgressUpdated",
      mapGiveToGetProgressToResponse(finalProgressToPublish)
    );
  }
}
