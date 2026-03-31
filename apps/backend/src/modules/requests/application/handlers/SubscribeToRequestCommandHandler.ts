import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import RequestRepository from "../../domain/contracts/RequestRepository.js";
import SubscribeToRequestCommand from "../commands/SubscribeToRequestCommand.js";
import RequestNotFoundException from "../exceptions/RequestNotFoundException.js";
import RequestAlreadySubscribedException from "../exceptions/RequestAlreadySubscribedException.js";
import Subscription from "../../domain/entities/Subscription.js";
import SubscriptionResponse, { mapSubscriptionToResponse } from "../responses/SubscriptionResponse.js";

export default class SubscribeToRequestCommandHandler {
  constructor(private readonly requestRepository: RequestRepository) {}

  async execute(command: SubscribeToRequestCommand): Promise<SubscriptionResponse> {
    const userId = new Uuid(command.userId);
    const requestId = new Uuid(command.requestId);
    const request = await this.requestRepository.findById(requestId);

    if (!request) {
      throw new RequestNotFoundException(command.requestId);
    }

    const isSubscribed = await this.requestRepository.isSubscribed(userId, requestId);
    if (isSubscribed) {
      throw new RequestAlreadySubscribedException(command.userId, command.requestId);
    }

    const subscription = new Subscription(command.userId, command.requestId, new Date());

    await this.requestRepository.addSubscription(subscription);

    return mapSubscriptionToResponse(subscription);
  }
}
