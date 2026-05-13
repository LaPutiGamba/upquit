import BoardRepository from "../../domain/contracts/BoardRepository.js";
import BoardMember from "../../domain/entities/BoardMember.js";
import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import JoinPublicBoardCommand from "../commands/JoinPublicBoardCommand.js";
import BoardNotFoundException from "../exceptions/BoardNotFoundException.js";
import BoardIsPrivateException from "../exceptions/BoardIsPrivateException.js";

export default class JoinPublicBoardCommandHandler {
  constructor(private readonly boardRepository: BoardRepository) {}

  async execute(command: JoinPublicBoardCommand): Promise<void> {
    const boardId = new Uuid(command.boardId);
    const requesterUserId = new Uuid(command.requesterUserId);

    const board = await this.boardRepository.findById(boardId);

    if (!board) {
      throw new BoardNotFoundException(command.boardId);
    }

    if (board.owner.id.getValue() === requesterUserId.getValue()) {
      return;
    }

    if (!board.isPublic) {
      throw new BoardIsPrivateException(command.boardId);
    }

    const existingMember = await this.boardRepository.findMemberByBoardIdAndUserId(boardId, requesterUserId);

    if (existingMember) {
      return;
    }

    const member = new BoardMember(requesterUserId.getValue(), boardId.getValue(), "member", new Date());
    await this.boardRepository.addMember(member);
  }
}
