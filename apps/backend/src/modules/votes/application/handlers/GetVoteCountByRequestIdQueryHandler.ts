import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import VoteRepository from "../../domain/contracts/VoteRepository.js";
import GetVoteCountByRequestIdQuery from "../queries/GetVoteCountByRequestIdQuery.js";

export default class GetVoteCountByRequestIdQueryHandler {
  constructor(private readonly voteRepository: VoteRepository) {}

  async execute(query: GetVoteCountByRequestIdQuery): Promise<number> {
    const requestId = new Uuid(query.requestId);

    return this.voteRepository.countByRequestId(requestId);
  }
}
