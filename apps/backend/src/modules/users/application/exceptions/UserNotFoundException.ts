export default class UserNotFoundException extends Error {
  constructor(identifier: string) {
    super(`User not found: ${identifier}`);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
