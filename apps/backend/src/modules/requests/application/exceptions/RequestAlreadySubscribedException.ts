import ApplicationException from "../../../../shared/application/exceptions/ApplicationException.js";

export default class RequestAlreadySubscribedException extends ApplicationException {
  public readonly statusCode = 409;
  public readonly errorCode = "REQUEST_ALREADY_SUBSCRIBED";

  constructor(userId: string, requestId: string) {
    super(`User ${userId} is already subscribed to request ${requestId}`);
  }
}
