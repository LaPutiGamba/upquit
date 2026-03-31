import { type StatusValue } from "../../domain/value-objects/RequestStatus.js";

export default class UpdateRequestCommand {
  constructor(
    readonly requestId: string,
    readonly title?: string,
    readonly description?: string | null,
    readonly categoryId?: string | null,
    readonly status?: StatusValue,
    readonly voteCount?: number,
    readonly isPinned?: boolean,
    readonly isHidden?: boolean,
    readonly adminNote?: string | null
  ) {}
}
