export interface GetRequestChangelogFilters {
  requestId: string;
  field?: string[];
  userId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export default class GetRequestChangelogByRequestIdQuery {
  readonly requestId: string;
  readonly field?: string[];
  readonly userId?: string;
  readonly search?: string;
  readonly limit: number;
  readonly offset: number;

  constructor(params: GetRequestChangelogFilters) {
    this.requestId = params.requestId;
    this.field = params.field;
    this.userId = params.userId;
    this.search = params.search;
    this.limit = params.limit ?? 50;
    this.offset = params.offset ?? 0;
  }
}
