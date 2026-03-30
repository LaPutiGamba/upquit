import Uuid from "../../../../shared/domain/value-objects/Uuid.js";

export default class Comment {
  constructor(
    public readonly id: Uuid,
    public readonly requestId: Uuid,
    public readonly userId: Uuid,
    public parentId: Uuid | null,
    public content: string,
    public isAdminReply: boolean | null,
    public readonly createdAt: Date | null
  ) {}
}
