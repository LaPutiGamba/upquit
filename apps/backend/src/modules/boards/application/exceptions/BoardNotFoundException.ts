export default class BoardNotFoundException extends Error {
  constructor(identifier: string) {
    super(`Board not found: ${identifier}`);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
