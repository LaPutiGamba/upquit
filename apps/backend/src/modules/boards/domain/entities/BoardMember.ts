import Uuid from "../../../../shared/domain/value-objects/Uuid.js";

export default class BoardMember {
  constructor(
    userId: string,
    boardId: string,
    public readonly role: string,
    public readonly createdAt: Date | null
  ) {
    this.userId = new Uuid(userId);
    this.boardId = new Uuid(boardId);
  }

  public readonly userId: Uuid;
  public readonly boardId: Uuid;
}
