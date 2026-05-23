import { Request, Response } from "express";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import BoardDrizzleRepository from "../repositories/BoardDrizzleRepository.js";
import GetBoardsByUserIdQuery, { BoardsByUserSortBy } from "../../application/queries/GetBoardsByUserIdQuery.js";
import GetBoardsByUserIdQueryHandler from "../../application/handlers/GetBoardsByUserIdQueryHandler.js";
import InvalidUuidException from "../../../../shared/domain/exceptions/InvalidUuidException.js";

const ALLOWED_SORT_VALUES: BoardsByUserSortBy[] = ["name", "recent"];

export default async function GetBoardsByUserGetController(req: Request, res: Response) {
  const queryHandler = new GetBoardsByUserIdQueryHandler(new BoardDrizzleRepository(db));

  try {
    if (!req.userId) {
      return res.status(401).send({ error: "UNAUTHORIZED", message: "User not authenticated" });
    }

    const search = typeof req.query.search === "string" ? req.query.search : undefined;

    const requestedSortBy = typeof req.query.sortBy === "string" ? req.query.sortBy : "name";
    if (!ALLOWED_SORT_VALUES.includes(requestedSortBy as BoardsByUserSortBy)) {
      return res.status(400).send({
        error: "INVALID_SORT_BY",
        message: `sortBy must be one of: ${ALLOWED_SORT_VALUES.join(", ")}`
      });
    }

    const requestedLimit = typeof req.query.limit === "string" ? Number(req.query.limit) : 50;
    const requestedOffset = typeof req.query.offset === "string" ? Number(req.query.offset) : 0;

    const limit = Number.isFinite(requestedLimit) ? Math.min(100, Math.max(1, Math.trunc(requestedLimit))) : 50;
    const offset = Number.isFinite(requestedOffset) ? Math.max(0, Math.trunc(requestedOffset)) : 0;

    const query = new GetBoardsByUserIdQuery({
      userId: req.userId,
      search,
      sortBy: requestedSortBy as BoardsByUserSortBy,
      limit,
      offset
    });

    const response = await queryHandler.execute(query);
    return res.status(200).json(response);
  } catch (ex) {
    if (ex instanceof InvalidUuidException) {
      return res.status(400).send({
        error: "INVALID_USER_ID",
        message: ex.message
      });
    }

    console.error(ex);
    return res.sendStatus(500);
  }
}
