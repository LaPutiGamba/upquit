import { type StatusValue } from "../../domain/value-objects/RequestStatus.js";

export default class CreateRequestCommand {
  constructor(
    readonly boardId: string,
    readonly authorId: string,
    readonly title: string,
    readonly description: string | null = null,
    readonly categoryId: string | null = null,
    readonly status: StatusValue = "open",
    readonly voteCount: number = 0,
    readonly isPinned: boolean = false,
    readonly isHidden: boolean = false,
    readonly adminNote: string | null = null
  ) {}
}
