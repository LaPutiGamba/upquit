import Uuid from "../../../../shared/domain/value-objects/Uuid.js";

export default class BoardMember {
  constructor(
    public readonly userId: Uuid,
    public readonly boardId: Uuid,
    public role: string,
    public readonly createdAt: Date | null
  ) {}
}
