import Uuid from "../../../../shared/domain/value-objects/Uuid.js";

export default class Subscription {
  constructor(
    public readonly userId: Uuid,
    public readonly requestId: Uuid,
    public readonly createdAt: Date | null
  ) {}
}
