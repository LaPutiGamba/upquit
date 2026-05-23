import { Request, Response } from "express";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import CommentDrizzleRepository from "../repositories/CommentDrizzleRepository.js";
import GetCommentsByRequestIdQuery, { CommentSortOrder } from "../../application/queries/GetCommentsByRequestIdQuery.js";
import GetCommentsByRequestIdQueryHandler from "../../application/handlers/GetCommentsByRequestIdQueryHandler.js";
import InvalidUuidException from "../../../../shared/domain/exceptions/InvalidUuidException.js";

const ALLOWED_SORT_VALUES: CommentSortOrder[] = ["newest_first", "oldest_first"];

export default async function GetCommentsByRequestIdGetController(req: Request, res: Response) {
  const queryHandler = new GetCommentsByRequestIdQueryHandler(new CommentDrizzleRepository(db));

  try {
    const requestId = req.query.requestId;
    if (typeof requestId !== "string") {
      throw new InvalidUuidException(String(requestId));
    }

    const requestedSortBy = typeof req.query.sortBy === "string" ? req.query.sortBy : "newest_first";
    if (!ALLOWED_SORT_VALUES.includes(requestedSortBy as CommentSortOrder)) {
      return res.status(400).send({
        error: "INVALID_SORT_BY",
        message: `sortBy must be one of: ${ALLOWED_SORT_VALUES.join(", ")}`
      });
    }

    const adminOnly = req.query.adminOnly === "true";

    const requestedLimit = typeof req.query.limit === "string" ? Number(req.query.limit) : 100;
    const requestedOffset = typeof req.query.offset === "string" ? Number(req.query.offset) : 0;

    const limit = Number.isFinite(requestedLimit) ? Math.min(200, Math.max(1, Math.trunc(requestedLimit))) : 100;
    const offset = Number.isFinite(requestedOffset) ? Math.max(0, Math.trunc(requestedOffset)) : 0;

    const command = new GetCommentsByRequestIdQuery({
      requestId,
      sortBy: requestedSortBy as CommentSortOrder,
      adminOnly,
      limit,
      offset
    });

    const response = await queryHandler.execute(command);
    return res.status(200).json(response);
  } catch (ex) {
    if (ex instanceof InvalidUuidException) {
      return res.status(400).send({
        error: "INVALID_REQUEST_ID",
        message: ex.message
      });
    }

    console.error(ex);
    return res.sendStatus(500);
  }
}
