import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import RealtimePublisher from "../../../../shared/domain/contracts/RealtimePublisher.js";
import VoteRepository from "../../domain/contracts/VoteRepository.js";
import Vote from "../../domain/entities/Vote.js";
import CreateVoteCommand from "../commands/CreateVoteCommand.js";
import VoteAlreadyExistsException from "../exceptions/VoteAlreadyExistsException.js";
import VoteResponse, { mapVoteToResponse } from "../responses/VoteResponse.js";
import EventBus from "../../../../shared/domain/events/EventBus.js";
import VoteCreatedEvent from "../../domain/events/VoteCreatedEvent.js";

export default class CreateVoteCommandHandler {
  constructor(
    private readonly voteRepository: VoteRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: CreateVoteCommand): Promise<VoteResponse> {
    const requestId = new Uuid(command.requestId);
    const userId = new Uuid(command.userId);

    const existingVote = await this.voteRepository.findByRequestAndUser(requestId, userId);
    if (existingVote) {
      throw new VoteAlreadyExistsException(command.userId, command.requestId);
    }

    const vote = new Vote(crypto.randomUUID(), command.requestId, command.userId, command.boardId, new Date());

    await this.voteRepository.save(vote);

    const response = mapVoteToResponse(vote);

    await this.eventBus.publish([
      new VoteCreatedEvent(vote.id.getValue(), command.requestId, command.userId, command.boardId)
    ]);

    return response;
  }
}
