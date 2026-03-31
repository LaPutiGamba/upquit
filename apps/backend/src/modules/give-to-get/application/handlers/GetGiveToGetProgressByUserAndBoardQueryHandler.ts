import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import GiveToGetProgressRepository from "../../domain/contracts/GiveToGetProgressRepository.js";
import GetGiveToGetProgressByUserAndBoardQuery from "../queries/GetGiveToGetProgressByUserAndBoardQuery.js";
import GiveToGetProgressNotFoundException from "../exceptions/GiveToGetProgressNotFoundException.js";
import GiveToGetProgressResponse, { mapGiveToGetProgressToResponse } from "../responses/GiveToGetProgressResponse.js";

export default class GetGiveToGetProgressByUserAndBoardQueryHandler {
  constructor(private readonly giveToGetProgressRepository: GiveToGetProgressRepository) {}

  async execute(query: GetGiveToGetProgressByUserAndBoardQuery): Promise<GiveToGetProgressResponse> {
    const userId = new Uuid(query.userId);
    const boardId = new Uuid(query.boardId);
    const progress = await this.giveToGetProgressRepository.findByUserAndBoard(userId, boardId);

    if (!progress) {
      throw new GiveToGetProgressNotFoundException(`${query.userId}:${query.boardId}`);
    }

    return mapGiveToGetProgressToResponse(progress);
  }
}
