import GiveToGetProgress from "../../domain/entities/GiveToGetProgress.js";
import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import GiveToGetProgressRepository from "../../domain/contracts/GiveToGetProgressRepository.js";
import UpdateGiveToGetProgressCommand from "../commands/UpdateGiveToGetProgressCommand.js";
import GiveToGetProgressNotFoundException from "../exceptions/GiveToGetProgressNotFoundException.js";
import GiveToGetProgressResponse, { mapGiveToGetProgressToResponse } from "../responses/GiveToGetProgressResponse.js";
import UnauthorizedActionException from "../../../../shared/application/exceptions/UnauthorizedActionException.js";

export default class UpdateGiveToGetProgressCommandHandler {
  constructor(private readonly giveToGetProgressRepository: GiveToGetProgressRepository) {}

  async execute(command: UpdateGiveToGetProgressCommand): Promise<GiveToGetProgressResponse> {
    const progressId = new Uuid(command.progressId);
    const progress = await this.giveToGetProgressRepository.findById(progressId);

    if (!progress) {
      throw new GiveToGetProgressNotFoundException(command.progressId);
    }

    if (progress.userId.getValue() !== command.userId) {
      throw new UnauthorizedActionException("You can only update your own give-to-get progress");
    }

    const updatedProgress = new GiveToGetProgress(
      progress.id.getValue(),
      progress.userId.getValue(),
      progress.boardId.getValue(),
      command.votesGiven !== undefined ? command.votesGiven : progress.votesGiven,
      command.qualifyingComments !== undefined ? command.qualifyingComments : progress.qualifyingComments,
      command.canPost !== undefined ? command.canPost : progress.canPost,
      command.unlockedAt !== undefined ? command.unlockedAt : progress.unlockedAt
    );

    await this.giveToGetProgressRepository.update(updatedProgress);

    return mapGiveToGetProgressToResponse(updatedProgress);
  }
}
