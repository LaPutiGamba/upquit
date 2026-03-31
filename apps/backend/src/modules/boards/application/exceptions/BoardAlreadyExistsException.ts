export default class BoardAlreadyExistsException extends Error {
  constructor(slug: string) {
    super(`Board with slug ${slug} already exists`);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
