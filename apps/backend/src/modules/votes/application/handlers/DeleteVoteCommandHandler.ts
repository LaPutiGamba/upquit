import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import EventBus from "../../../../shared/domain/events/EventBus.js";
import VoteRepository from "../../domain/contracts/VoteRepository.js";
import DeleteVoteCommand from "../commands/DeleteVoteCommand.js";
import VoteNotFoundException from "../exceptions/VoteNotFoundException.js";
import VoteDeletedEvent from "../../domain/events/VoteDeletedEvent.js";

export default class DeleteVoteCommandHandler {
  constructor(
    private readonly voteRepository: VoteRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: DeleteVoteCommand): Promise<void> {
    const voteId = new Uuid(command.voteId);
    const vote = await this.voteRepository.findById(voteId);
    if (!vote) {
      throw new VoteNotFoundException(command.voteId);
    }

    await this.voteRepository.delete(voteId);

    const event = new VoteDeletedEvent(
      vote.id.getValue(),
      vote.requestId.getValue(),
      vote.userId.getValue(),
      vote.boardId.getValue()
    );

    await this.eventBus.publish([event]);
  }
}
