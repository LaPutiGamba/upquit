import ApplicationException from "../../../../shared/application/exceptions/ApplicationException.js";

export default class UserAlreadyDeactivatedException extends ApplicationException {
  public readonly statusCode = 400;
  public readonly errorCode = "USER_ALREADY_DEACTIVATED";

  constructor(userId: string) {
    super(`User is already deactivated: ${userId}`);
  }
}
