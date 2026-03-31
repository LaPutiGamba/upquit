export default class RequestNotFoundException extends Error {
  constructor(identifier: string) {
    super(`Request not found: ${identifier}`);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
