import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import RequestStatus, { type StatusValue } from "../value-objects/RequestStatus.js";
import User from "../../../users/domain/entities/User.js";

export default class Request {
  constructor(
    id: string,
    public readonly author: User,
    boardId: string,
    public readonly categoryIds: string[],
    public readonly title: string,
    public readonly description: string | null,
    status: StatusValue,
    public readonly voteCount: number | null,
    public readonly isPinned: boolean | null,
    public readonly isHidden: boolean | null,
    public readonly adminNote: string | null,
    public readonly createdAt: Date | null
  ) {
    this.id = new Uuid(id);
    this.boardId = new Uuid(boardId);
    this.status = new RequestStatus(status);
  }

  public readonly id: Uuid;
  public readonly boardId: Uuid;
  public readonly status: RequestStatus;
}
