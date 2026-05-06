import ApplicationException from "../../../../shared/application/exceptions/ApplicationException.js";

export default class VoteAlreadyExistsException extends ApplicationException {
  public readonly statusCode = 409;
  public readonly errorCode = "VOTE_ALREADY_EXISTS";

  constructor(userId: string, requestId: string) {
    super(`Vote already exists for user ${userId} and request ${requestId}`);
  }
}
