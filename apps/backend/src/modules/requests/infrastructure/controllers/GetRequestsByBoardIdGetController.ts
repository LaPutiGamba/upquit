import { Request, Response } from "express";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import RequestDrizzleRepository from "../repositories/RequestDrizzleRepository.js";
import GetRequestsByBoardIdQuery, { RequestSortBy } from "../../application/queries/GetRequestsByBoardIdQuery.js";
import GetRequestsByBoardIdQueryHandler from "../../application/handlers/GetRequestsByBoardIdQueryHandler.js";
import InvalidUuidException from "../../../../shared/domain/exceptions/InvalidUuidException.js";

const ALLOWED_SORT_VALUES: RequestSortBy[] = ["newest", "oldest", "recently_updated"];
const ALLOWED_STATUS_VALUES = ["open", "planned", "in_progress", "completed", "rejected"];

export default async function GetRequestsByBoardIdGetController(req: Request, res: Response) {
  const queryHandler = new GetRequestsByBoardIdQueryHandler(new RequestDrizzleRepository(db));

  try {
    const boardId = req.query.boardId;
    if (typeof boardId !== "string") {
      throw new InvalidUuidException(String(boardId));
    }

    const search = typeof req.query.search === "string" ? req.query.search : undefined;

    const statusQuery = req.query.status;
    let status: string[] | undefined;
    if (typeof statusQuery === "string") {
      status = [statusQuery];
    } else if (Array.isArray(statusQuery)) {
      status = statusQuery.filter((s): s is string => typeof s === "string");
    }

    if (status) {
      const invalidStatus = status.filter((s) => !ALLOWED_STATUS_VALUES.includes(s));
      if (invalidStatus.length > 0) {
        return res.status(400).send({
          error: "INVALID_STATUS",
          message: `Invalid status values: ${invalidStatus.join(", ")}. Must be one of: ${ALLOWED_STATUS_VALUES.join(", ")}`
        });
      }
    }

    const categoryId = typeof req.query.categoryId === "string" ? req.query.categoryId : undefined;

    const requestedSortBy = typeof req.query.sortBy === "string" ? req.query.sortBy : "newest";
    if (!ALLOWED_SORT_VALUES.includes(requestedSortBy as RequestSortBy)) {
      return res.status(400).send({
        error: "INVALID_SORT_BY",
        message: `sortBy must be one of: ${ALLOWED_SORT_VALUES.join(", ")}`
      });
    }

    const authorId = typeof req.query.authorId === "string" ? req.query.authorId : undefined;
    const pinnedOnly = req.query.pinnedOnly === "true";
    const excludePinned = req.query.excludePinned === "true";

    const requestedLimit = typeof req.query.limit === "string" ? Number(req.query.limit) : 100;
    const requestedOffset = typeof req.query.offset === "string" ? Number(req.query.offset) : 0;

    const limit = Number.isFinite(requestedLimit) ? Math.min(200, Math.max(1, Math.trunc(requestedLimit))) : 100;
    const offset = Number.isFinite(requestedOffset) ? Math.max(0, Math.trunc(requestedOffset)) : 0;

    const command = new GetRequestsByBoardIdQuery({
      boardId,
      status,
      categoryId,
      search,
      sortBy: requestedSortBy as RequestSortBy,
      authorId,
      pinnedOnly,
      excludePinned,
      limit,
      offset
    });

    const response = await queryHandler.execute(command);
    return res.status(200).json(response);
  } catch (ex) {
    if (ex instanceof InvalidUuidException) {
      return res.status(400).send({
        error: "INVALID_BOARD_ID",
        message: ex.message
      });
    }

    console.error(ex);
    return res.sendStatus(500);
  }
}
