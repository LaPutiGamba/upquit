import Uuid from "../../../../shared/domain/value-objects/Uuid.js";

export default class Category {
  constructor(
    id: string,
    boardId: string,
    public readonly name: string,
    public readonly createdAt: Date | null
  ) {
    this.id = new Uuid(id);
    this.boardId = new Uuid(boardId);
  }

  public readonly id: Uuid;
  public readonly boardId: Uuid;
}
