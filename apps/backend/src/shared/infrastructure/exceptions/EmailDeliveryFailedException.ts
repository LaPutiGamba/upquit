export default class EmailDeliveryFailedException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailDeliveryFailedException";
  }
}
