import VoteDeletedEvent from "../../../votes/domain/events/VoteDeletedEvent.js";
import RequestRepository from "../../domain/contracts/RequestRepository.js";
import RealtimePublisher from "../../../../shared/domain/contracts/RealtimePublisher.js";
import Uuid from "../../../../shared/domain/value-objects/Uuid.js";

export default class DecrementVoteCountOnVoteDeleted {
  constructor(
    private readonly requestRepository: RequestRepository,
    private readonly realtimePublisher: RealtimePublisher
  ) {}

  async handle(event: VoteDeletedEvent): Promise<void> {
    const requestId = new Uuid(event.requestId);
    await this.requestRepository.decrementVoteCount(requestId);

    const request = await this.requestRepository.findById(requestId);
    if (request) {
      const userId = new Uuid(event.userId);
      const boardId = new Uuid(event.boardId);
      const payload = {
        boardId: boardId.getValue(),
        requestId: event.requestId,
        voteId: event.voteId,
        userId: userId.getValue(),
        action: "deleted",
        voteCount: request.voteCount
      };

      this.realtimePublisher.publish(`request.${userId.getValue()}.${boardId.getValue()}`, "RequestUpdated", payload);
      this.realtimePublisher.publish(`request.${boardId.getValue()}`, "RequestUpdated", payload);
    }
  }
}
