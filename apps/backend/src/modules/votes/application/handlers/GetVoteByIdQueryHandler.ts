import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import VoteRepository from "../../domain/contracts/VoteRepository.js";
import GetVoteByIdQuery from "../queries/GetVoteByIdQuery.js";
import VoteNotFoundException from "../exceptions/VoteNotFoundException.js";
import VoteResponse, { mapVoteToResponse } from "../responses/VoteResponse.js";

export default class GetVoteByIdQueryHandler {
  constructor(private readonly voteRepository: VoteRepository) {}

  async execute(query: GetVoteByIdQuery): Promise<VoteResponse> {
    const voteId = new Uuid(query.voteId);
    const vote = await this.voteRepository.findById(voteId);

    if (!vote) {
      throw new VoteNotFoundException(query.voteId);
    }

    return mapVoteToResponse(vote);
  }
}
