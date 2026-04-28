import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import EventBus from "../../../../shared/domain/events/EventBus.js";
import BoardRepository from "../../domain/contracts/BoardRepository.js";
import DeleteBoardCommand from "../commands/DeleteBoardCommand.js";
import BoardNotFoundException from "../exceptions/BoardNotFoundException.js";
import UnauthorizedActionException from "../../../../shared/application/exceptions/UnauthorizedActionException.js";
import BoardDeletedEvent from "../../domain/events/BoardDeletedEvent.js";

export default class DeleteBoardCommandHandler {
  constructor(
    private readonly boardRepository: BoardRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: DeleteBoardCommand): Promise<void> {
    const boardId = new Uuid(command.boardId);
    const requesterUserId = new Uuid(command.requesterUserId);
    const board = await this.boardRepository.findById(boardId);

    if (!board) {
      throw new BoardNotFoundException(command.boardId);
    }

    const isOwner = board.ownerId.getValue() === requesterUserId.getValue();

    if (!isOwner) {
      throw new UnauthorizedActionException("Only board owners can delete boards");
    }

    await this.boardRepository.delete(board.id.getValue());

    await this.eventBus.publish([new BoardDeletedEvent(board.id.getValue())]);
  }
}
