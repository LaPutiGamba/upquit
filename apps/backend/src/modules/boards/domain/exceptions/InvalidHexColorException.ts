import DomainException from "../../../../shared/domain/exceptions/DomainException.js";

export default class InvalidHexColorException extends DomainException {
  public readonly errorCode = "INVALID_HEX_COLOR";

  constructor(hexColor: string) {
    super(`The hex color provided is invalid or exceeds the maximum length: ${hexColor}`);
  }
}
