export default class UserAlreadyDeactivatedException extends Error {
  constructor(userId: string) {
    super(`User is already deactivated: ${userId}`);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
