import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import BoardRepository from "../../domain/contracts/BoardRepository.js";
import GetPublicBoardsByUserIdQuery from "../queries/GetPublicBoardsByUserIdQuery.js";
import BoardResponse, { mapBoardToResponse } from "../responses/BoardResponse.js";

export default class GetPublicBoardsByUserIdQueryHandler {
  constructor(private readonly boardRepository: BoardRepository) {}

  async execute(query: GetPublicBoardsByUserIdQuery): Promise<BoardResponse[]> {
    const userId = new Uuid(query.userId);
    const boards = await this.boardRepository.findByUserId(userId);

    const publicBoards = boards.filter((board) => board.isPublic && board.owner.id.getValue() === query.userId);

    return publicBoards.map(mapBoardToResponse);
  }
}
