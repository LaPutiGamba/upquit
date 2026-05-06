import ApplicationException from "../../../../shared/application/exceptions/ApplicationException.js";

export default class UserNotFoundException extends ApplicationException {
  public readonly statusCode = 404;
  public readonly errorCode = "USER_NOT_FOUND";

  constructor(identifier: string) {
    super(`User not found: ${identifier}`);
  }
}
