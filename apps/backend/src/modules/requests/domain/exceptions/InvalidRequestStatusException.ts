import DomainException from "../../../../shared/domain/exceptions/DomainException.js";

export default class InvalidRequestStatusException extends DomainException {
  constructor(status: string) {
    super(`The request status provided is invalid: ${status}`);
  }
}
