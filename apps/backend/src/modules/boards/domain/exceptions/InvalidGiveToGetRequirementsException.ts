import DomainException from "../../../../shared/domain/exceptions/DomainException.js";

export default class InvalidGiveToGetRequirementsException extends DomainException {
  constructor() {
    super("When Give-to-Get is enabled, votes required and comments required cannot both be 0.");
  }
}
