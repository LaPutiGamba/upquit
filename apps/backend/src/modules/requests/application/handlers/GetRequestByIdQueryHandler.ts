import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import RequestRepository from "../../domain/contracts/RequestRepository.js";
import GetRequestByIdQuery from "../queries/GetRequestByIdQuery.js";
import RequestNotFoundException from "../exceptions/RequestNotFoundException.js";
import RequestResponse, { mapRequestToResponse } from "../responses/RequestResponse.js";

export default class GetRequestByIdQueryHandler {
  constructor(private readonly requestRepository: RequestRepository) {}

  async execute(query: GetRequestByIdQuery): Promise<RequestResponse> {
    const requestId = new Uuid(query.requestId);
    const request = await this.requestRepository.findById(requestId);

    if (!request) {
      throw new RequestNotFoundException(query.requestId);
    }

    return mapRequestToResponse(request);
  }
}
