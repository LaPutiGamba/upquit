import ApplicationException from "../../../../shared/application/exceptions/ApplicationException.js";

export default class RequestAlreadySubscribedException extends ApplicationException {
  constructor(userId: string, requestId: string) {
    super(`User ${userId} is already subscribed to request ${requestId}`);
  }
}
