import VoteCreatedEvent from "../../../votes/domain/events/VoteCreatedEvent.js";
import GiveToGetProgressRepository from "../../domain/contracts/GiveToGetProgressRepository.js";
import BoardRepository from "../../../boards/domain/contracts/BoardRepository.js";
import GiveToGetProgress from "../../domain/entities/GiveToGetProgress.js";
import Uuid from "../../../../shared/domain/value-objects/Uuid.js";

export default class UpdateProgressOnVoteCreated {
  constructor(
    private readonly progressRepository: GiveToGetProgressRepository,
    private readonly boardRepository: BoardRepository
  ) {}

  async handle(event: VoteCreatedEvent): Promise<void> {
    const userId = new Uuid(event.userId);
    const boardId = new Uuid(event.boardId);

    const board = await this.boardRepository.findById(boardId);
    if (!board || !board.giveToGetEnabled) {
      return;
    }

    let currentProgress = await this.progressRepository.findByUserAndBoard(userId, boardId);

    if (!currentProgress) {
      const newProgressId = crypto.randomUUID();
      currentProgress = new GiveToGetProgress(
        newProgressId,
        event.userId,
        event.boardId,
        1, // votesGiven
        0, // qualifyingComments
        false, // canPost 
        null // unlockedAt
      );
      await this.progressRepository.save(currentProgress);
    } else {
      await this.progressRepository.incrementVotesGiven(userId, boardId);
      currentProgress = await this.progressRepository.findByUserAndBoard(userId, boardId);
    }

    if (currentProgress && !currentProgress.canPost) {
      const reqVotes = board.giveToGetVotesReq ?? 0;
      const reqComments = board.giveToGetCommentsReq ?? 0;

      const currentVotes = currentProgress.votesGiven ?? 0;
      const currentComments = currentProgress.qualifyingComments ?? 0;

      const meetsVotes = currentVotes >= reqVotes;
      const meetsComments = currentComments >= reqComments;

      if (meetsVotes && meetsComments) {
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
      }
    }
  }
}
