import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import VoteRepository from "../../domain/contracts/VoteRepository.js";
import GetVoteByRequestAndUserQuery from "../queries/GetVoteByRequestAndUserQuery.js";
import VoteNotFoundException from "../exceptions/VoteNotFoundException.js";
import VoteResponse, { mapVoteToResponse } from "../responses/VoteResponse.js";

export default class GetVoteByRequestAndUserQueryHandler {
  constructor(private readonly voteRepository: VoteRepository) {}

  async execute(query: GetVoteByRequestAndUserQuery): Promise<VoteResponse> {
    const requestId = new Uuid(query.requestId);
    const userId = new Uuid(query.userId);
    const vote = await this.voteRepository.findByRequestAndUser(requestId, userId);

    if (!vote) {
      throw new VoteNotFoundException(`${query.userId}:${query.requestId}`);
    }

    return mapVoteToResponse(vote);
  }
}
