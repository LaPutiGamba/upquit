import Uuid from "../../../../shared/domain/value-objects/Uuid.js";

export default class Vote {
  constructor(
    public readonly id: Uuid,
    public readonly requestId: Uuid,
    public readonly userId: Uuid,
    public readonly boardId: Uuid,
    public readonly createdAt: Date | null
  ) {}
}
