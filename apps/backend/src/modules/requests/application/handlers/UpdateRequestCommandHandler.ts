import Request from "../../domain/entities/Request.js";
import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import RealtimePublisher from "../../../../shared/domain/contracts/RealtimePublisher.js";
import RequestRepository from "../../domain/contracts/RequestRepository.js";
import UpdateRequestCommand from "../commands/UpdateRequestCommand.js";
import RequestNotFoundException from "../exceptions/RequestNotFoundException.js";
import RequestResponse, { mapRequestToResponse } from "../responses/RequestResponse.js";
import UnauthorizedActionException from "../../../../shared/application/exceptions/UnauthorizedActionException.js";

export default class UpdateRequestCommandHandler {
  constructor(
    private readonly requestRepository: RequestRepository,
    private readonly realtimePublisher: RealtimePublisher
  ) {}

  async execute(command: UpdateRequestCommand): Promise<RequestResponse> {
    const requestId = new Uuid(command.requestId);
    const request = await this.requestRepository.findById(requestId);

    if (!request) {
      throw new RequestNotFoundException(command.requestId);
    }

    if (request.authorId.getValue() !== command.userId) {
      throw new UnauthorizedActionException("You can only update your own requests");
    }

    const updatedRequest = new Request(
      request.id.getValue(),
      request.boardId.getValue(),
      request.authorId.getValue(),
      command.categoryId !== undefined ? command.categoryId : (request.categoryId?.getValue() ?? null),
      command.title ?? request.title,
      command.description !== undefined ? command.description : request.description,
      command.status ?? request.status.getValue(),
      command.voteCount !== undefined ? command.voteCount : request.voteCount,
      command.isPinned !== undefined ? command.isPinned : request.isPinned,
      command.isHidden !== undefined ? command.isHidden : request.isHidden,
      command.adminNote !== undefined ? command.adminNote : request.adminNote,
      request.createdAt
    );

    await this.requestRepository.update(updatedRequest);

    const response = mapRequestToResponse(updatedRequest);
    const hasTitleChanged = request.title !== updatedRequest.title;
    const hasStatusChanged = request.status.getValue() !== updatedRequest.status.getValue();

    if (hasTitleChanged || hasStatusChanged) {
      this.realtimePublisher.publish(updatedRequest.boardId.getValue(), "REQUEST_UPDATED", {
        boardId: updatedRequest.boardId.getValue(),
        request: response
      });
    }

    return response;
  }
}
