export default class VoteAlreadyExistsException extends Error {
  constructor(userId: string, requestId: string) {
    super(`Vote already exists for user ${userId} and request ${requestId}`);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
