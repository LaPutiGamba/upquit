import Uuid from "../../../../shared/domain/value-objects/Uuid.js";

export default class Category {
  constructor(
    public readonly id: Uuid,
    public readonly boardId: Uuid,
    public name: string,
    public readonly createdAt: Date | null
  ) {}
}
