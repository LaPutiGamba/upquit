export type BoardMemberRole = "admin" | "member";

export interface GetBoardMembersFilters {
  boardId: string;
  role?: BoardMemberRole;
  search?: string;
  limit?: number;
  offset?: number;
}

export default class GetBoardMembersByBoardIdQuery {
  readonly boardId: string;
  readonly role?: BoardMemberRole;
  readonly search?: string;
  readonly limit: number;
  readonly offset: number;

  constructor(params: GetBoardMembersFilters) {
    this.boardId = params.boardId;
    this.role = params.role;
    this.search = params.search;
    this.limit = params.limit ?? 50;
    this.offset = params.offset ?? 0;
  }
}
