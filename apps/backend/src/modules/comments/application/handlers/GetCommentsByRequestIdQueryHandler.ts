import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import CommentRepository from "../../domain/contracts/CommentRepository.js";
import GetCommentsByRequestIdQuery from "../queries/GetCommentsByRequestIdQuery.js";
import CommentResponse, { mapCommentToResponse } from "../responses/CommentResponse.js";

export default class GetCommentsByRequestIdQueryHandler {
  constructor(private readonly commentRepository: CommentRepository) {}

  async execute(query: GetCommentsByRequestIdQuery): Promise<CommentResponse[]> {
    const requestId = new Uuid(query.requestId);
    const comments = await this.commentRepository.findByRequestIdWithAuthor(requestId);

    return comments.map(({ comment, authorDisplayName, authorAvatarUrl }) =>
      mapCommentToResponse(comment, authorDisplayName, authorAvatarUrl)
    );
  }
}
