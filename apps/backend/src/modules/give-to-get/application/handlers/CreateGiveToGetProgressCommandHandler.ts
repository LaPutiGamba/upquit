import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import GiveToGetProgress from "../../domain/entities/GiveToGetProgress.js";
import GiveToGetProgressRepository from "../../domain/contracts/GiveToGetProgressRepository.js";
import CreateGiveToGetProgressCommand from "../commands/CreateGiveToGetProgressCommand.js";
import GiveToGetProgressAlreadyExistsException from "../exceptions/GiveToGetProgressAlreadyExistsException.js";
import GiveToGetProgressResponse, { mapGiveToGetProgressToResponse } from "../responses/GiveToGetProgressResponse.js";

export default class CreateGiveToGetProgressCommandHandler {
  constructor(private readonly giveToGetProgressRepository: GiveToGetProgressRepository) {}

  async execute(command: CreateGiveToGetProgressCommand): Promise<GiveToGetProgressResponse> {
    const userId = new Uuid(command.userId);
    const boardId = new Uuid(command.boardId);

    const existingProgress = await this.giveToGetProgressRepository.findByUserAndBoard(userId, boardId);
    if (existingProgress) {
      throw new GiveToGetProgressAlreadyExistsException(command.userId, command.boardId);
    }

    const progress = new GiveToGetProgress(
      crypto.randomUUID(),
      command.userId,
      command.boardId,
      command.votesGiven ?? 0,
      command.qualifyingComments ?? 0,
      command.canPost ?? false,
      command.unlockedAt ?? null
    );

    await this.giveToGetProgressRepository.save(progress);

    return mapGiveToGetProgressToResponse(progress);
  }
}
