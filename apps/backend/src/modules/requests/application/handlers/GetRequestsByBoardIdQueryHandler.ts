import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import RequestRepository, { FindByBoardIdFilters } from "../../domain/contracts/RequestRepository.js";
import GetRequestsByBoardIdQuery from "../queries/GetRequestsByBoardIdQuery.js";
import RequestResponse, { mapRequestToResponse } from "../responses/RequestResponse.js";

export default class GetRequestsByBoardIdQueryHandler {
  constructor(private readonly requestRepository: RequestRepository) {}

  async execute(query: GetRequestsByBoardIdQuery): Promise<RequestResponse[]> {
    const boardId = new Uuid(query.boardId);

    const filters: FindByBoardIdFilters = {
      status: query.status,
      categoryId: query.categoryId,
      search: query.search,
      sortBy: query.sortBy,
      authorId: query.authorId,
      pinnedOnly: query.pinnedOnly,
      excludePinned: query.excludePinned,
      limit: query.limit,
      offset: query.offset
    };

    const requests = await this.requestRepository.findByBoardId(boardId, filters);

    return requests.map(mapRequestToResponse);
  }
}
