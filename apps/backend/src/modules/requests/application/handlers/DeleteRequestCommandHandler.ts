import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import EventBus from "../../../../shared/domain/events/EventBus.js";
import RequestRepository from "../../domain/contracts/RequestRepository.js";
import DeleteRequestCommand from "../commands/DeleteRequestCommand.js";
import RequestNotFoundException from "../exceptions/RequestNotFoundException.js";
import UnauthorizedActionException from "../../../../shared/application/exceptions/UnauthorizedActionException.js";
import RequestDeletedEvent from "../../domain/events/RequestDeletedEvent.js";

export default class DeleteRequestCommandHandler {
  constructor(
    private readonly requestRepository: RequestRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: DeleteRequestCommand): Promise<void> {
    const requestId = new Uuid(command.requestId);
    const requesterUserId = new Uuid(command.requesterUserId);
    const request = await this.requestRepository.findById(requestId);

    if (!request) {
      throw new RequestNotFoundException(command.requestId);
    }

    const isAuthor = request.authorId.getValue() === requesterUserId.getValue();

    if (!isAuthor) {
      const canManageBoardRequests = await this.requestRepository.isBoardOwnerOrAdmin(request.boardId, requesterUserId);

      if (!canManageBoardRequests) {
        throw new UnauthorizedActionException(
          "Only request authors, board owners, or board admins can delete requests"
        );
      }
    }

    await this.requestRepository.delete(request.id.getValue());

    await this.eventBus.publish([new RequestDeletedEvent(request.id.getValue())]);
  }
}
