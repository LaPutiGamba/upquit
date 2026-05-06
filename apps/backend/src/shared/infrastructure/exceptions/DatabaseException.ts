import InfrastructureException from "./InfrastructureException.js";

export default class DatabaseException extends InfrastructureException {
  public readonly errorCode = "DATABASE_ERROR";

  constructor(message: string) {
    super(`Database Error: ${message}`);
  }
}
