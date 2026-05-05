import Request from "../../domain/entities/Request.js";
import RealtimePublisher from "../../../../shared/domain/contracts/RealtimePublisher.js";
import RequestRepository from "../../domain/contracts/RequestRepository.js";
import CreateRequestCommand from "../commands/CreateRequestCommand.js";
import RequestResponse, { mapRequestToResponse } from "../responses/RequestResponse.js";
import EventBus from "../../../../shared/domain/events/EventBus.js";
import RequestCreatedEvent from "../../domain/events/RequestCreatedEvent.js";
import UserRepository from "../../../users/domain/contracts/UserRepository.js";
import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import AuthorNotFoundException from "../exceptions/AuthorNotFoundException.js";

export default class CreateRequestCommandHandler {
  constructor(
    private readonly requestRepository: RequestRepository,
    private readonly userRepository: UserRepository,
    private readonly realtimePublisher: RealtimePublisher,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: CreateRequestCommand): Promise<RequestResponse> {
    const authorId = new Uuid(command.authorId);
    const author = await this.userRepository.findById(authorId);

    if (!author) {
      throw new AuthorNotFoundException(command.authorId);
    }

    const request = new Request(
      crypto.randomUUID(),
      author,
      command.boardId,
      command.categoryIds,
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

    const createdRequest = await this.requestRepository.findById(request.id);
    const response = mapRequestToResponse(createdRequest!);

    this.realtimePublisher.publish(`request.${command.boardId}`, "RequestCreated", {
      boardId: command.boardId,
      request: response
    });

    await this.eventBus.publish([
      new RequestCreatedEvent(
        request.id.getValue(),
        request.boardId.getValue(),
        request.author.id.getValue(),
        request.title
      )
    ]);

    return response;
  }
}
