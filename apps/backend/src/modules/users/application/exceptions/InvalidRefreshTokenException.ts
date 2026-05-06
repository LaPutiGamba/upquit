import ApplicationException from "../../../../shared/application/exceptions/ApplicationException.js";

export default class InvalidRefreshTokenException extends ApplicationException {
  public readonly statusCode = 401;
  public readonly errorCode = "INVALID_REFRESH_TOKEN";

  constructor() {
    super("Invalid or expired refresh token");
  }
}
