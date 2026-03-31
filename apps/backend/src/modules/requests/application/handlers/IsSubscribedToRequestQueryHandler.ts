import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import RequestRepository from "../../domain/contracts/RequestRepository.js";
import IsSubscribedToRequestQuery from "../queries/IsSubscribedToRequestQuery.js";
import RequestNotFoundException from "../exceptions/RequestNotFoundException.js";

export default class IsSubscribedToRequestQueryHandler {
  constructor(private readonly requestRepository: RequestRepository) {}

  async execute(query: IsSubscribedToRequestQuery): Promise<boolean> {
    const userId = new Uuid(query.userId);
    const requestId = new Uuid(query.requestId);
    const request = await this.requestRepository.findById(requestId);

    if (!request) {
      throw new RequestNotFoundException(query.requestId);
    }

    return this.requestRepository.isSubscribed(userId, requestId);
  }
}
