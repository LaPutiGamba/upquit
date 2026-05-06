import DomainException from "./DomainException.js";

export default class InvalidUuidException extends DomainException {
  public readonly errorCode = "INVALID_UUID";

  constructor(uuid: string) {
    super(`The UUID provided is invalid: ${uuid}`);
  }
}
