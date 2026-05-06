import InfrastructureException from "./InfrastructureException.js";

export default class EmailDeliveryFailedException extends InfrastructureException {
  public readonly errorCode = "EMAIL_DELIVERY_FAILED";

  constructor(message: string) {
    super(`Email Delivery Error: ${message}`);
  }
}
