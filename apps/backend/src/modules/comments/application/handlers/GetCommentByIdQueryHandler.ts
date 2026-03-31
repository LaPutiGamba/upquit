import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import CommentRepository from "../../domain/contracts/CommentRepository.js";
import GetCommentByIdQuery from "../queries/GetCommentByIdQuery.js";
import CommentNotFoundException from "../exceptions/CommentNotFoundException.js";
import CommentResponse, { mapCommentToResponse } from "../responses/CommentResponse.js";

export default class GetCommentByIdQueryHandler {
  constructor(private readonly commentRepository: CommentRepository) {}

  async execute(query: GetCommentByIdQuery): Promise<CommentResponse> {
    const commentId = new Uuid(query.commentId);
    const comment = await this.commentRepository.findById(commentId);

    if (!comment) {
      throw new CommentNotFoundException(query.commentId);
    }

    return mapCommentToResponse(comment);
  }
}
