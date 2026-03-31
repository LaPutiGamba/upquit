import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import BoardRepository from "../../domain/contracts/BoardRepository.js";
import GetBoardByIdQuery from "../queries/GetBoardByIdQuery.js";
import BoardNotFoundException from "../exceptions/BoardNotFoundException.js";
import BoardResponse, { mapBoardToResponse } from "../responses/BoardResponse.js";

export default class GetBoardByIdQueryHandler {
  constructor(private readonly boardRepository: BoardRepository) {}

  async execute(query: GetBoardByIdQuery): Promise<BoardResponse> {
    const boardId = new Uuid(query.boardId);
    const board = await this.boardRepository.findById(boardId);

    if (!board) {
      throw new BoardNotFoundException(query.boardId);
    }

    return mapBoardToResponse(board);
  }
}
