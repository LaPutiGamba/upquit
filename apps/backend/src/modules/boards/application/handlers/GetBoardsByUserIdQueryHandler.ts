import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import BoardRepository, { FindBoardsByUserFilters } from "../../domain/contracts/BoardRepository.js";
import GetBoardsByUserIdQuery from "../queries/GetBoardsByUserIdQuery.js";
import BoardResponse, { mapBoardToResponse } from "../responses/BoardResponse.js";

export default class GetBoardsByUserIdQueryHandler {
  constructor(private readonly boardRepository: BoardRepository) {}

  async execute(query: GetBoardsByUserIdQuery): Promise<BoardResponse[]> {
    const userId = new Uuid(query.userId);

    const filters: FindBoardsByUserFilters = {
      search: query.search,
      sortBy: query.sortBy,
      limit: query.limit,
      offset: query.offset
    };

    const boards = await this.boardRepository.findByUserId(userId, filters);

    return boards.map(mapBoardToResponse);
  }
}
