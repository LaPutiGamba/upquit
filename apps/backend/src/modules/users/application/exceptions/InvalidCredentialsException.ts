import ApplicationException from "../../../../shared/application/exceptions/ApplicationException.js";

export default class InvalidCredentialsException extends ApplicationException {
  public readonly statusCode = 401;
  public readonly errorCode = "INVALID_CREDENTIALS";

  constructor() {
    super("Invalid email or password");
  }
}
