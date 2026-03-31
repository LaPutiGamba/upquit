import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import GiveToGetProgressRepository from "../../domain/contracts/GiveToGetProgressRepository.js";
import GetGiveToGetProgressByIdQuery from "../queries/GetGiveToGetProgressByIdQuery.js";
import GiveToGetProgressNotFoundException from "../exceptions/GiveToGetProgressNotFoundException.js";
import GiveToGetProgressResponse, { mapGiveToGetProgressToResponse } from "../responses/GiveToGetProgressResponse.js";

export default class GetGiveToGetProgressByIdQueryHandler {
  constructor(private readonly giveToGetProgressRepository: GiveToGetProgressRepository) {}

  async execute(query: GetGiveToGetProgressByIdQuery): Promise<GiveToGetProgressResponse> {
    const progressId = new Uuid(query.progressId);
    const progress = await this.giveToGetProgressRepository.findById(progressId);

    if (!progress) {
      throw new GiveToGetProgressNotFoundException(query.progressId);
    }

    return mapGiveToGetProgressToResponse(progress);
  }
}
