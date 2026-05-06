export default abstract class DomainException extends Error {
  public readonly statusCode: number = 400;
  public abstract readonly errorCode: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
