import VoteCreatedEvent from "../../../votes/domain/events/VoteCreatedEvent.js";
import RequestRepository from "../../domain/contracts/RequestRepository.js";
import RealtimePublisher from "../../../../shared/domain/contracts/RealtimePublisher.js";
import Uuid from "../../../../shared/domain/value-objects/Uuid.js";

export default class IncrementVoteCountOnVoteCreated {
  constructor(
    private readonly requestRepository: RequestRepository,
    private readonly realtimePublisher: RealtimePublisher
  ) {}

  async handle(event: VoteCreatedEvent): Promise<void> {
    const id = new Uuid(event.requestId);
    await this.requestRepository.incrementVoteCount(id);

    const request = await this.requestRepository.findById(id);
    if (request) {
      this.realtimePublisher.publish(event.boardId, "VOTE_COUNT_CHANGED", {
        boardId: event.boardId,
        requestId: event.requestId,
        voteCount: request.voteCount
      });
    }
  }
}
