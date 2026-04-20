import BoardRepository from "../../domain/contracts/BoardRepository.js";
import AddBoardMemberCommand from "../commands/AddBoardMemberCommand.js";
import BoardNotFoundException from "../exceptions/BoardNotFoundException.js";
import BoardMember from "../../domain/entities/BoardMember.js";
import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import UnauthorizedActionException from "../../../../shared/application/exceptions/UnauthorizedActionException.js";
import BoardMemberAlreadyExistsException from "../exceptions/BoardMemberAlreadyExistsException.js";

export default class AddBoardMemberCommandHandler {
  constructor(private readonly boardRepository: BoardRepository) {}

  async execute(command: AddBoardMemberCommand): Promise<void> {
    const boardId = new Uuid(command.boardId);
    const requesterUserId = new Uuid(command.requesterUserId);
    const targetUserId = new Uuid(command.targetUserId);
    const board = await this.boardRepository.findById(boardId);
    const requesterIsBoardOwner = board?.ownerId.getValue() === requesterUserId.getValue();

    if (!board) {
      throw new BoardNotFoundException(command.boardId);
    }

    if (!requesterIsBoardOwner) {
      const requesterMembership = await this.boardRepository.findMemberByBoardIdAndUserId(boardId, requesterUserId);

      if (requesterMembership?.role !== "admin") {
        throw new UnauthorizedActionException("Only board owners or admins can manage members");
      }

      if (command.role !== "member") {
        throw new UnauthorizedActionException("Board admins can only add users as members");
      }
    }

    const existingMember = await this.boardRepository.findMemberByBoardIdAndUserId(boardId, targetUserId);

    if (existingMember) {
      throw new BoardMemberAlreadyExistsException(command.targetUserId, command.boardId);
    }

    const member = new BoardMember(command.targetUserId, command.boardId, command.role, new Date());
    await this.boardRepository.addMember(member);
  }
}
