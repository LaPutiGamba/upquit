export default class VoteNotFoundException extends Error {
  constructor(identifier: string) {
    super(`Vote not found: ${identifier}`);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
