import DomainException from "../../../../shared/domain/exceptions/DomainException.js";

export default class InvalidEmailException extends DomainException {
  constructor(email: string) {
    super(`The email provided is invalid or exceeds the maximum length: ${email}`);
  }
}
