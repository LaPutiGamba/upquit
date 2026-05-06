import ApplicationException from "../../../../shared/application/exceptions/ApplicationException.js";

export default class UserAlreadyExistsException extends ApplicationException {
  public readonly statusCode = 409;
  public readonly errorCode = "USER_ALREADY_EXISTS";

  constructor(email: string) {
    super(`User with email ${email} already exists`);
  }
}
