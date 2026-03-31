import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import BoardRepository from "../../domain/contracts/BoardRepository.js";
import GetBoardMembersByBoardIdQuery from "../queries/GetBoardMembersByBoardIdQuery.js";
import BoardNotFoundException from "../exceptions/BoardNotFoundException.js";
import BoardMemberResponse, { mapBoardMemberToResponse } from "../responses/BoardMemberResponse.js";

export default class GetBoardMembersByBoardIdQueryHandler {
  constructor(private readonly boardRepository: BoardRepository) {}

  async execute(query: GetBoardMembersByBoardIdQuery): Promise<BoardMemberResponse[]> {
    const boardId = new Uuid(query.boardId);
    const board = await this.boardRepository.findById(boardId);

    if (!board) {
      throw new BoardNotFoundException(query.boardId);
    }

    const members = await this.boardRepository.findMembersByBoardId(boardId);
    return members.map(mapBoardMemberToResponse);
  }
}
