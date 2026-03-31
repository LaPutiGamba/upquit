import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import RequestRepository from "../../domain/contracts/RequestRepository.js";
import GetRequestsByBoardIdQuery from "../queries/GetRequestsByBoardIdQuery.js";
import RequestResponse, { mapRequestToResponse } from "../responses/RequestResponse.js";

export default class GetRequestsByBoardIdQueryHandler {
  constructor(private readonly requestRepository: RequestRepository) {}

  async execute(query: GetRequestsByBoardIdQuery): Promise<RequestResponse[]> {
    const boardId = new Uuid(query.boardId);
    const requests = await this.requestRepository.findByBoardId(boardId);

    return requests.map(mapRequestToResponse);
  }
}
