import Uuid from "../../../../shared/domain/value-objects/Uuid.js";

export default class Comment {
  constructor(
    id: string,
    requestId: string,
    userId: string,
    parentId: string | null,
    public readonly content: string,
    public readonly isAdminReply: boolean | null,
    public readonly createdAt: Date | null
  ) {
    this.id = new Uuid(id);
    this.requestId = new Uuid(requestId);
    this.userId = new Uuid(userId);
    this.parentId = parentId ? new Uuid(parentId) : null;
  }

  public readonly id: Uuid;
  public readonly requestId: Uuid;
  public readonly userId: Uuid;
  public readonly parentId: Uuid | null;
}
