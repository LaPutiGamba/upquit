import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import RequestStatus from "../value-objects/RequestStatus.js";

export default class Request {
  constructor(
    public readonly id: Uuid,
    public readonly boardId: Uuid,
    public readonly authorId: Uuid,
    public categoryId: Uuid | null,
    public title: string,
    public description: string | null,
    public status: RequestStatus,
    public voteCount: number | null,
    public isPinned: boolean | null,
    public isHidden: boolean | null,
    public adminNote: string | null,
    public readonly createdAt: Date | null
  ) {}
}
