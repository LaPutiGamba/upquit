import ApplicationException from "../../../../shared/application/exceptions/ApplicationException.js";

export default class InvalidRefreshTokenException extends ApplicationException {
  constructor() {
    super("Invalid or expired refresh token");
  }
}
