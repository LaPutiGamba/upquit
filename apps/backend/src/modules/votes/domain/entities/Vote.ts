import Uuid from "../../../../shared/domain/value-objects/Uuid.js";

export default class Vote {
  constructor(
    id: string,
    requestId: string,
    userId: string,
    boardId: string,
    public readonly createdAt: Date | null
  ) {
    this.id = new Uuid(id);
    this.requestId = new Uuid(requestId);
    this.userId = new Uuid(userId);
    this.boardId = new Uuid(boardId);
  }

  public readonly id: Uuid;
  public readonly requestId: Uuid;
  public readonly userId: Uuid;
  public readonly boardId: Uuid;
}
