import ApplicationException from "../../../../shared/application/exceptions/ApplicationException.js";

export default class UsernameAlreadyExistsException extends ApplicationException {
  public readonly statusCode = 409;
  public readonly errorCode = "USERNAME_ALREADY_EXISTS";

  constructor(username: string) {
    super(`Username ${username} already exists`);
  }
}
