export default class RequestAlreadySubscribedException extends Error {
  constructor(userId: string, requestId: string) {
    super(`User ${userId} is already subscribed to request ${requestId}`);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
