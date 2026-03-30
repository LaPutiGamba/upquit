import DomainException from "./DomainException.js";

export default class InvalidUuidException extends DomainException {
  constructor(uuid: string) {
    super(`The UUID provided is invalid: ${uuid}`);
  }
}
