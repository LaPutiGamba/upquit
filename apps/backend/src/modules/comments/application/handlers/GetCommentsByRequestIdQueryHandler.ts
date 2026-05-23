import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import CommentRepository, { FindCommentsFilters } from "../../domain/contracts/CommentRepository.js";
import GetCommentsByRequestIdQuery from "../queries/GetCommentsByRequestIdQuery.js";
import CommentResponse, { mapCommentToResponse } from "../responses/CommentResponse.js";

export default class GetCommentsByRequestIdQueryHandler {
  constructor(private readonly commentRepository: CommentRepository) {}

  async execute(query: GetCommentsByRequestIdQuery): Promise<CommentResponse[]> {
    const requestId = new Uuid(query.requestId);

    const filters: FindCommentsFilters = {
      sortBy: query.sortBy,
      adminOnly: query.adminOnly,
      limit: query.limit,
      offset: query.offset
    };

    const comments = await this.commentRepository.findByRequestIdWithAuthor(requestId, filters);

    return comments.map(({ comment, authorDisplayName, authorAvatarUrl, authorUsername }) =>
      mapCommentToResponse(comment, authorDisplayName, authorAvatarUrl, authorUsername)
    );
  }
}
