import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import CommentRepository from "../../domain/contracts/CommentRepository.js";
import GetCommentsByParentIdQuery from "../queries/GetCommentsByParentIdQuery.js";
import CommentNotFoundException from "../exceptions/CommentNotFoundException.js";
import CommentResponse, { mapCommentToResponse } from "../responses/CommentResponse.js";

export default class GetCommentsByParentIdQueryHandler {
  constructor(private readonly commentRepository: CommentRepository) {}

  async execute(query: GetCommentsByParentIdQuery): Promise<CommentResponse[]> {
    const parentId = new Uuid(query.parentId);
    const parentComment = await this.commentRepository.findById(parentId);

    if (!parentComment) {
      throw new CommentNotFoundException(query.parentId);
    }

    const comments = await this.commentRepository.findByParentId(parentId);
    return comments.map(mapCommentToResponse);
  }
}
