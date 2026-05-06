import DomainException from "../../../../shared/domain/exceptions/DomainException.js";

export default class InvalidGiveToGetRequirementsException extends DomainException {
  public readonly errorCode = "INVALID_GIVE_TO_GET_REQUIREMENTS";

  constructor() {
    super("When Give-to-Get is enabled, votes required and comments required cannot both be 0.");
  }
}
