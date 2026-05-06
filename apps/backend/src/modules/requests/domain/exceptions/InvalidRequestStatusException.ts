import DomainException from "../../../../shared/domain/exceptions/DomainException.js";

export default class InvalidRequestStatusException extends DomainException {
  public readonly errorCode = "INVALID_REQUEST_STATUS";

  constructor(status: string) {
    super(`The request status provided is invalid: ${status}`);
  }
}
