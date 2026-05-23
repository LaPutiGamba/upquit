export type CommentSortOrder = "newest_first" | "oldest_first";

export interface GetCommentsByRequestIdQueryParams {
  requestId: string;
  sortBy?: CommentSortOrder;
  adminOnly?: boolean;
  limit?: number;
  offset?: number;
}

export default class GetCommentsByRequestIdQuery {
  readonly requestId: string;
  readonly sortBy: CommentSortOrder;
  readonly adminOnly: boolean;
  readonly limit: number;
  readonly offset: number;

  constructor(params: GetCommentsByRequestIdQueryParams) {
    this.requestId = params.requestId;
    this.sortBy = params.sortBy ?? "newest_first";
    this.adminOnly = params.adminOnly ?? false;
    this.limit = params.limit ?? 100;
    this.offset = params.offset ?? 0;
  }
}
