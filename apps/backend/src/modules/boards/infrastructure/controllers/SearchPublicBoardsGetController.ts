import { Request, Response } from "express";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import BoardDrizzleRepository from "../repositories/BoardDrizzleRepository.js";
import SearchPublicBoardsQuery from "../../application/queries/SearchPublicBoardsQuery.js";
import SearchPublicBoardsQueryHandler from "../../application/handlers/SearchPublicBoardsQueryHandler.js";
import type { PublicBoardSortBy } from "../../domain/contracts/BoardRepository.js";

const ALLOWED_SORT_VALUES: PublicBoardSortBy[] = ["recent", "name", "members"];

export default async function SearchPublicBoardsGetController(req: Request, res: Response) {
  const queryHandler = new SearchPublicBoardsQueryHandler(new BoardDrizzleRepository(db));

  try {
    const searchTerm = typeof req.query.search === "string" ? req.query.search : "";
    const requestedSortBy = typeof req.query.sortBy === "string" ? req.query.sortBy : "recent";

    if (!ALLOWED_SORT_VALUES.includes(requestedSortBy as PublicBoardSortBy)) {
      return res.status(400).send({
        error: "INVALID_SORT_BY",
        message: `sortBy must be one of: ${ALLOWED_SORT_VALUES.join(", ")}`
      });
    }

    const requestedLimit = typeof req.query.limit === "string" ? Number(req.query.limit) : 20;
    const requestedOffset = typeof req.query.offset === "string" ? Number(req.query.offset) : 0;

    const limit = Number.isFinite(requestedLimit) ? Math.min(50, Math.max(1, Math.trunc(requestedLimit))) : 20;
    const offset = Number.isFinite(requestedOffset) ? Math.max(0, Math.trunc(requestedOffset)) : 0;

    const query = new SearchPublicBoardsQuery(searchTerm, requestedSortBy as PublicBoardSortBy, limit, offset);
    const response = await queryHandler.execute(query);

    return res.status(200).json(response);
  } catch (ex) {
    console.error(ex);
    return res.sendStatus(500);
  }
}
