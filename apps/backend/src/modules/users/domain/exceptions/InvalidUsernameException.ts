import DomainException from "../../../../shared/domain/exceptions/DomainException.js";

export default class InvalidUsernameException extends DomainException {
  public readonly errorCode = "INVALID_USERNAME";

  constructor(username: string) {
    super(`The username provided is invalid or exceeds the maximum length: ${username}`);
  }
}
