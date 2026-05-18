import ApplicationException from "../../../../shared/application/exceptions/ApplicationException.js";

export default class InvalidResetTokenException extends ApplicationException {
  public readonly statusCode = 401;
  public readonly errorCode = "INVALID_RESET_TOKEN";

  constructor(message: string = "Invalid or expired password reset token") {
    super(message);
  }
}
