export default class InvalidRefreshTokenException extends Error {
  constructor() {
    super("Invalid or expired refresh token");
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
