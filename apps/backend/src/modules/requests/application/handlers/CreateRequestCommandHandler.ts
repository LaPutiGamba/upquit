import Request from "../../domain/entities/Request.js";
import RequestRepository from "../../domain/contracts/RequestRepository.js";
import CreateRequestCommand from "../commands/CreateRequestCommand.js";
import RequestResponse, { mapRequestToResponse } from "../responses/RequestResponse.js";

export default class CreateRequestCommandHandler {
  constructor(private readonly requestRepository: RequestRepository) {}

  async execute(command: CreateRequestCommand): Promise<RequestResponse> {
    const request = new Request(
      crypto.randomUUID(),
      command.boardId,
      command.authorId,
      command.categoryId,
      command.title,
      command.description,
      command.status,
      command.voteCount,
      command.isPinned,
      command.isHidden,
      command.adminNote,
      new Date()
    );

    await this.requestRepository.save(request);

    return mapRequestToResponse(request);
  }
}
