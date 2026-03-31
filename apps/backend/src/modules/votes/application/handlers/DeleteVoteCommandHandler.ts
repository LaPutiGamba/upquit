import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import VoteRepository from "../../domain/contracts/VoteRepository.js";
import DeleteVoteCommand from "../commands/DeleteVoteCommand.js";
import VoteNotFoundException from "../exceptions/VoteNotFoundException.js";

export default class DeleteVoteCommandHandler {
  constructor(private readonly voteRepository: VoteRepository) {}

  async execute(command: DeleteVoteCommand): Promise<void> {
    const voteId = new Uuid(command.voteId);
    const vote = await this.voteRepository.findById(voteId);

    if (!vote) {
      throw new VoteNotFoundException(command.voteId);
    }

    await this.voteRepository.delete(voteId);
  }
}
