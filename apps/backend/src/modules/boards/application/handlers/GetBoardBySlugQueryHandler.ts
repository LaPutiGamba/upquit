import Slug from "../../domain/value-objects/Slug.js";
import BoardRepository from "../../domain/contracts/BoardRepository.js";
import GetBoardBySlugQuery from "../queries/GetBoardBySlugQuery.js";
import BoardNotFoundException from "../exceptions/BoardNotFoundException.js";
import BoardResponse, { mapBoardToResponse } from "../responses/BoardResponse.js";

export default class GetBoardBySlugQueryHandler {
  constructor(private readonly boardRepository: BoardRepository) {}

  async execute(query: GetBoardBySlugQuery): Promise<BoardResponse> {
    const slug = new Slug(query.slug);
    const board = await this.boardRepository.findBySlug(slug);

    if (!board) {
      throw new BoardNotFoundException(query.slug);
    }

    return mapBoardToResponse(board);
  }
}
