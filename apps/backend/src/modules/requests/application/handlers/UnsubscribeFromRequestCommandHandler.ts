import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import RequestRepository from "../../domain/contracts/RequestRepository.js";
import UnsubscribeFromRequestCommand from "../commands/UnsubscribeFromRequestCommand.js";
import RequestNotFoundException from "../exceptions/RequestNotFoundException.js";

export default class UnsubscribeFromRequestCommandHandler {
  constructor(private readonly requestRepository: RequestRepository) {}

  async execute(command: UnsubscribeFromRequestCommand): Promise<void> {
    const userId = new Uuid(command.userId);
    const requestId = new Uuid(command.requestId);
    const request = await this.requestRepository.findById(requestId);

    if (!request) {
      throw new RequestNotFoundException(command.requestId);
    }

    await this.requestRepository.removeSubscription(userId, requestId);
  }
}
