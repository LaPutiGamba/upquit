export type BoardsByUserSortBy = "name" | "recent";

export interface GetBoardsByUserIdQueryParams {
  userId: string;
  search?: string;
  sortBy?: BoardsByUserSortBy;
  limit?: number;
  offset?: number;
}

export default class GetBoardsByUserIdQuery {
  readonly userId: string;
  readonly search?: string;
  readonly sortBy: BoardsByUserSortBy;
  readonly limit: number;
  readonly offset: number;

  constructor(params: GetBoardsByUserIdQueryParams) {
    this.userId = params.userId;
    this.search = params.search;
    this.sortBy = params.sortBy ?? "name";
    this.limit = params.limit ?? 50;
    this.offset = params.offset ?? 0;
  }
}
