export default class InvalidCredentialsException extends Error {
  constructor() {
    super("Invalid email or password");
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
