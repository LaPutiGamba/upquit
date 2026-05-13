import type { PublicBoardSortBy } from "../../domain/contracts/BoardRepository.js";

export default class SearchPublicBoardsQuery {
  constructor(
    readonly searchTerm: string,
    readonly sortBy: PublicBoardSortBy,
    readonly limit: number,
    readonly offset: number
  ) {}
}
