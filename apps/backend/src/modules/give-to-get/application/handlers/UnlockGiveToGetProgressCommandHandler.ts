import GiveToGetProgress from "../../domain/entities/GiveToGetProgress.js";
import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import GiveToGetProgressRepository from "../../domain/contracts/GiveToGetProgressRepository.js";
import UnlockGiveToGetProgressCommand from "../commands/UnlockGiveToGetProgressCommand.js";
import GiveToGetProgressNotFoundException from "../exceptions/GiveToGetProgressNotFoundException.js";
import GiveToGetProgressResponse, { mapGiveToGetProgressToResponse } from "../responses/GiveToGetProgressResponse.js";

export default class UnlockGiveToGetProgressCommandHandler {
  constructor(private readonly giveToGetProgressRepository: GiveToGetProgressRepository) {}

  async execute(command: UnlockGiveToGetProgressCommand): Promise<GiveToGetProgressResponse> {
    const progressId = new Uuid(command.progressId);
    const progress = await this.giveToGetProgressRepository.findById(progressId);

    if (!progress) {
      throw new GiveToGetProgressNotFoundException(command.progressId);
    }

    const unlockedProgress = new GiveToGetProgress(
      progress.id.getValue(),
      progress.userId.getValue(),
      progress.boardId.getValue(),
      progress.votesGiven,
      progress.qualifyingComments,
      true,
      progress.unlockedAt ?? new Date()
    );

    await this.giveToGetProgressRepository.update(unlockedProgress);

    return mapGiveToGetProgressToResponse(unlockedProgress);
  }
}
