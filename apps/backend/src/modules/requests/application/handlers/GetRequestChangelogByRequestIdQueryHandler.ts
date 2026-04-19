import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import RequestRepository from "../../domain/contracts/RequestRepository.js";
import GetRequestChangelogByRequestIdQuery from "../queries/GetRequestChangelogByRequestIdQuery.js";
import RequestChangelogResponse, { mapRequestChangelogToResponse } from "../responses/RequestChangelogResponse.js";

export default class GetRequestChangelogByRequestIdQueryHandler {
  constructor(private readonly requestRepository: RequestRepository) {}

  async execute(query: GetRequestChangelogByRequestIdQuery): Promise<RequestChangelogResponse[]> {
    const requestId = new Uuid(query.requestId);
    const changelogEntries = await this.requestRepository.findChangelogByRequestId(requestId);

    return changelogEntries.map((entry) => mapRequestChangelogToResponse(entry));
  }
}
