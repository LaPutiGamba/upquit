export type RequestSortBy = "newest" | "oldest" | "recently_updated";

export interface GetRequestsByBoardIdQueryParams {
  boardId: string;
  status?: string[];
  categoryId?: string;
  search?: string;
  sortBy?: RequestSortBy;
  authorId?: string;
  pinnedOnly?: boolean;
  excludePinned?: boolean;
  limit?: number;
  offset?: number;
}

export default class GetRequestsByBoardIdQuery {
  readonly boardId: string;
  readonly status?: string[];
  readonly categoryId?: string;
  readonly search?: string;
  readonly sortBy: RequestSortBy;
  readonly authorId?: string;
  readonly pinnedOnly: boolean;
  readonly excludePinned: boolean;
  readonly limit: number;
  readonly offset: number;

  constructor(params: GetRequestsByBoardIdQueryParams) {
    this.boardId = params.boardId;
    this.status = params.status;
    this.categoryId = params.categoryId;
    this.search = params.search;
    this.sortBy = params.sortBy ?? "newest";
    this.authorId = params.authorId;
    this.pinnedOnly = params.pinnedOnly ?? false;
    this.excludePinned = params.excludePinned ?? false;
    this.limit = params.limit ?? 100;
    this.offset = params.offset ?? 0;
  }
}
