import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import BoardMember from "../../domain/entities/BoardMember.js";
import BoardRepository from "../../domain/contracts/BoardRepository.js";
import AddBoardMemberCommand from "../commands/AddBoardMemberCommand.js";
import BoardNotFoundException from "../exceptions/BoardNotFoundException.js";
import BoardMemberResponse, { mapBoardMemberToResponse } from "../responses/BoardMemberResponse.js";

export default class AddBoardMemberCommandHandler {
  constructor(private readonly boardRepository: BoardRepository) {}

  async execute(command: AddBoardMemberCommand): Promise<BoardMemberResponse> {
    const boardId = new Uuid(command.boardId);
    const board = await this.boardRepository.findById(boardId);

    if (!board) {
      throw new BoardNotFoundException(command.boardId);
    }

    const member = new BoardMember(command.userId, command.boardId, command.role, new Date());
    await this.boardRepository.addMember(member);

    return mapBoardMemberToResponse(member);
  }
}
