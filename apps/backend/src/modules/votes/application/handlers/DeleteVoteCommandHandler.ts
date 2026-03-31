import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import RealtimePublisher from "../../../../shared/domain/contracts/RealtimePublisher.js";
import VoteRepository from "../../domain/contracts/VoteRepository.js";
import DeleteVoteCommand from "../commands/DeleteVoteCommand.js";
import VoteNotFoundException from "../exceptions/VoteNotFoundException.js";

export default class DeleteVoteCommandHandler {
  constructor(
    private readonly voteRepository: VoteRepository,
    private readonly realtimePublisher: RealtimePublisher
  ) {}

  async execute(command: DeleteVoteCommand): Promise<void> {
    const voteId = new Uuid(command.voteId);
    const vote = await this.voteRepository.findById(voteId);

    if (!vote) {
      throw new VoteNotFoundException(command.voteId);
    }

    await this.voteRepository.delete(voteId);

    const requestId = vote.requestId.getValue();
    const boardId = vote.boardId.getValue();
    const voteCount = await this.voteRepository.countByRequestId(vote.requestId);

    this.realtimePublisher.publish(boardId, "VOTE_COUNT_CHANGED", {
      boardId,
      requestId,
      voteCount
    });
  }
}
