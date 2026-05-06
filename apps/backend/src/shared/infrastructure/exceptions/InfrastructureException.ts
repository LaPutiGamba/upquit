import ApplicationException from "../../application/exceptions/ApplicationException.js";

export default abstract class InfrastructureException extends ApplicationException {
  public readonly statusCode: number = 500;
  public abstract readonly errorCode: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
