import BoardRepository from "../../domain/contracts/BoardRepository.js";
import type BoardResponse from "../responses/BoardResponse.js";
import { mapBoardToResponse } from "../responses/BoardResponse.js";
import SearchPublicBoardsQuery from "../queries/SearchPublicBoardsQuery.js";

export default class SearchPublicBoardsQueryHandler {
  constructor(private readonly boardRepository: BoardRepository) {}

  async execute(query: SearchPublicBoardsQuery): Promise<BoardResponse[]> {
    const boards = await this.boardRepository.searchPublicBoards(
      query.searchTerm,
      query.sortBy,
      query.limit,
      query.offset
    );

    return boards.map(mapBoardToResponse);
  }
}
