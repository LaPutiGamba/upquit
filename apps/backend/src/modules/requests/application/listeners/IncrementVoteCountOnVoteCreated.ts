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
      const userId = new Uuid(event.userId);
      const boardId = new Uuid(event.boardId);

      this.realtimePublisher.publish(`request.${userId.getValue()}.${boardId.getValue()}`, "RequestUpdated", {
        boardId: boardId.getValue(),
        requestId: event.requestId,
        voteCount: request.voteCount
      });
    }
  }
}
