import Request from "../../domain/entities/Request.js";
import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import RequestRepository from "../../domain/contracts/RequestRepository.js";
import UpdateRequestCommand from "../commands/UpdateRequestCommand.js";
import RequestNotFoundException from "../exceptions/RequestNotFoundException.js";
import RequestResponse, { mapRequestToResponse } from "../responses/RequestResponse.js";

export default class UpdateRequestCommandHandler {
  constructor(private readonly requestRepository: RequestRepository) {}

  async execute(command: UpdateRequestCommand): Promise<RequestResponse> {
    const requestId = new Uuid(command.requestId);
    const request = await this.requestRepository.findById(requestId);

    if (!request) {
      throw new RequestNotFoundException(command.requestId);
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

    return mapRequestToResponse(updatedRequest);
  }
}
