import ApplicationException from "../../../../shared/application/exceptions/ApplicationException.js";

export default class VoteNotFoundException extends ApplicationException {
  public readonly statusCode = 404;
  public readonly errorCode = "VOTE_NOT_FOUND";

  constructor(identifier: string) {
    super(`Vote not found: ${identifier}`);
  }
}
