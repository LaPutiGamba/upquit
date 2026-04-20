import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import BoardRepository from "../../domain/contracts/BoardRepository.js";
import UpdateBoardMemberRoleCommand from "../commands/UpdateBoardMemberRoleCommand.js";
import BoardNotFoundException from "../exceptions/BoardNotFoundException.js";
import BoardMemberNotFoundException from "../exceptions/BoardMemberNotFoundException.js";
import UnauthorizedActionException from "../../../../shared/application/exceptions/UnauthorizedActionException.js";

export default class UpdateBoardMemberRoleCommandHandler {
  constructor(private readonly boardRepository: BoardRepository) {}

  async execute(command: UpdateBoardMemberRoleCommand): Promise<void> {
    const boardId = new Uuid(command.boardId);
    const targetUserId = new Uuid(command.targetUserId);
    const requesterUserId = new Uuid(command.requesterUserId);
    const board = await this.boardRepository.findById(boardId);
    const requesterIsBoardOwner = board?.ownerId.getValue() === requesterUserId.getValue();

    if (!board) {
      throw new BoardNotFoundException(command.boardId);
    }

    if (board.ownerId.getValue() === targetUserId.getValue()) {
      throw new UnauthorizedActionException("The board owner role cannot be changed");
    }

    if (targetUserId.getValue() === requesterUserId.getValue()) {
      throw new UnauthorizedActionException("Board admins cannot change their own role");
    }

    if (!requesterIsBoardOwner) {
      const requesterMembership = await this.boardRepository.findMemberByBoardIdAndUserId(boardId, requesterUserId);

      if (requesterMembership?.role !== "admin") {
        throw new UnauthorizedActionException("Only board owners or admins can manage members");
      }

      if (command.role === "admin") {
        throw new UnauthorizedActionException("Board admins cannot assign admin role");
      }
    }

    const member = await this.boardRepository.findMemberByBoardIdAndUserId(boardId, targetUserId);

    if (!member) {
      throw new BoardMemberNotFoundException(command.targetUserId, command.boardId);
    }

    if (member.role === command.role) {
      return;
    }

    await this.boardRepository.updateMemberRole(boardId, targetUserId, command.role);
  }
}
