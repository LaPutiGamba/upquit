import Uuid from "../../../../shared/domain/value-objects/Uuid.js";

export default class Subscription {
  constructor(
    userId: string,
    requestId: string,
    public readonly createdAt: Date | null
  ) {
    this.userId = new Uuid(userId);
    this.requestId = new Uuid(requestId);
  }

  public readonly userId: Uuid;
  public readonly requestId: Uuid;
}
