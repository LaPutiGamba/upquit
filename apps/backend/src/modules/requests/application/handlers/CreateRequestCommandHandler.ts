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
import BoardRepository from "../../../boards/domain/contracts/BoardRepository.js";
import BoardNotFoundException from "../../../boards/application/exceptions/BoardNotFoundException.js";
import UnauthorizedActionException from "../../../../shared/application/exceptions/UnauthorizedActionException.js";

export default class CreateRequestCommandHandler {
  constructor(
    private readonly requestRepository: RequestRepository,
    private readonly boardRepository: BoardRepository,
    private readonly userRepository: UserRepository,
    private readonly realtimePublisher: RealtimePublisher,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: CreateRequestCommand): Promise<RequestResponse> {
    const boardId = new Uuid(command.boardId);
    const authorId = new Uuid(command.authorId);
    const author = await this.userRepository.findById(authorId);

    if (!author) {
      throw new AuthorNotFoundException(command.authorId);
    }

    const board = await this.boardRepository.findById(boardId);
    if (!board) {
      throw new BoardNotFoundException(command.boardId);
    }

    const boardMembers = await this.boardRepository.findMembersByBoardId(boardId);
    const isBoardOwner = board.owner.id.getValue() === command.authorId;
    const isBoardAdmin = boardMembers.some((member) => member.userId === command.authorId && member.role === "admin");

    if (!isBoardOwner && !isBoardAdmin && command.status !== "open") {
      throw new UnauthorizedActionException(
        "Only board owners or admins can choose a non-default status when creating a request"
      );
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
      data: {
        boardId: command.boardId,
        request: response
      },
      timestamp: new Date().toISOString()
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
