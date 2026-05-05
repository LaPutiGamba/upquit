import DomainException from "../../../../shared/domain/exceptions/DomainException.js";

export default class InvalidUsernameException extends DomainException {
  constructor(username: string) {
    super(`The username provided is invalid or exceeds the maximum length: ${username}`);
  }
}
