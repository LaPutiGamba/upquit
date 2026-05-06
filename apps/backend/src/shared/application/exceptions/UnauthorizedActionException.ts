import ApplicationException from "./ApplicationException.js";

export default class UnauthorizedActionException extends ApplicationException {
  public readonly statusCode = 403;
  public readonly errorCode = "UNAUTHORIZED_ACTION";

  constructor(message: string = "You do not have permission to perform this action") {
    super(message);
    this.name = "UnauthorizedActionException";
  }
}
