import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import BoardRepository from "../../domain/contracts/BoardRepository.js";
import GetBoardCategoriesByBoardIdQuery from "../queries/GetBoardCategoriesByBoardIdQuery.js";
import BoardNotFoundException from "../exceptions/BoardNotFoundException.js";
import CategoryResponse, { mapCategoryToResponse } from "../responses/CategoryResponse.js";

export default class GetBoardCategoriesByBoardIdQueryHandler {
  constructor(private readonly boardRepository: BoardRepository) {}

  async execute(query: GetBoardCategoriesByBoardIdQuery): Promise<CategoryResponse[]> {
    const boardId = new Uuid(query.boardId);
    const board = await this.boardRepository.findById(boardId);

    if (!board) {
      throw new BoardNotFoundException(query.boardId);
    }

    const categories = await this.boardRepository.findCategoriesByBoardId(boardId);
    return categories.map(mapCategoryToResponse);
  }
}
