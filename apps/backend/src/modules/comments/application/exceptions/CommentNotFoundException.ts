export default class CommentNotFoundException extends Error {
  constructor(identifier: string) {
    super(`Comment not found: ${identifier}`);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
