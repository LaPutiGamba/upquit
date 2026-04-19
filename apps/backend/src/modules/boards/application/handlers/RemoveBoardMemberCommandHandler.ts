import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import BoardRepository from "../../domain/contracts/BoardRepository.js";
import RemoveBoardMemberCommand from "../commands/RemoveBoardMemberCommand.js";
import BoardNotFoundException from "../exceptions/BoardNotFoundException.js";
import BoardMemberNotFoundException from "../exceptions/BoardMemberNotFoundException.js";
import UnauthorizedActionException from "../../../../shared/application/exceptions/UnauthorizedActionException.js";

export default class RemoveBoardMemberCommandHandler {
  constructor(private readonly boardRepository: BoardRepository) {}

  async execute(command: RemoveBoardMemberCommand): Promise<void> {
    const boardId = new Uuid(command.boardId);
    const targetUserId = new Uuid(command.targetUserId);
    const requesterUserId = new Uuid(command.requesterUserId);

    const board = await this.boardRepository.findById(boardId);

    if (!board) {
      throw new BoardNotFoundException(command.boardId);
    }

    if (board.ownerId.getValue() === targetUserId.getValue()) {
      throw new UnauthorizedActionException("The board owner cannot be removed from the team");
    }

    if (targetUserId.getValue() === requesterUserId.getValue()) {
      throw new UnauthorizedActionException("Board admins cannot remove themselves from the team");
    }

    if (board.ownerId.getValue() !== requesterUserId.getValue()) {
      const requesterMembership = await this.boardRepository.findMemberByBoardIdAndUserId(boardId, requesterUserId);

      if (requesterMembership?.role !== "admin") {
        throw new UnauthorizedActionException("Only board owners or admins can manage members");
      }
    }

    const member = await this.boardRepository.findMemberByBoardIdAndUserId(boardId, targetUserId);

    if (!member) {
      throw new BoardMemberNotFoundException(command.targetUserId, command.boardId);
    }

    await this.boardRepository.removeMember(boardId, targetUserId);
  }
}
