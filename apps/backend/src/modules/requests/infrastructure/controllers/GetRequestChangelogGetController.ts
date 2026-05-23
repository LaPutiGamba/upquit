import { Request, Response } from "express";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import RequestDrizzleRepository from "../repositories/RequestDrizzleRepository.js";
import GetRequestChangelogByRequestIdQuery from "../../application/queries/GetRequestChangelogByRequestIdQuery.js";
import GetRequestChangelogByRequestIdQueryHandler from "../../application/handlers/GetRequestChangelogByRequestIdQueryHandler.js";
import InvalidUuidException from "../../../../shared/domain/exceptions/InvalidUuidException.js";

type GetRequestChangelogGetParams = {
  id: string;
};

export default async function GetRequestChangelogGetController(
  req: Request<GetRequestChangelogGetParams>,
  res: Response
) {
  const queryHandler = new GetRequestChangelogByRequestIdQueryHandler(new RequestDrizzleRepository(db));

  try {
    const field = Array.isArray(req.query.field)
      ? req.query.field.filter((value): value is string => typeof value === "string" && value.length > 0)
      : typeof req.query.field === "string"
        ? [req.query.field]
        : undefined;
    const userId = typeof req.query.userId === "string" ? req.query.userId : undefined;
    const search = typeof req.query.search === "string" ? req.query.search : undefined;

    const requestedLimit = typeof req.query.limit === "string" ? Number(req.query.limit) : 50;
    const requestedOffset = typeof req.query.offset === "string" ? Number(req.query.offset) : 0;

    const limit = Number.isFinite(requestedLimit) ? Math.min(200, Math.max(1, Math.trunc(requestedLimit))) : 50;
    const offset = Number.isFinite(requestedOffset) ? Math.max(0, Math.trunc(requestedOffset)) : 0;

    const command = new GetRequestChangelogByRequestIdQuery({
      requestId: req.params.id,
      field,
      userId,
      search,
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
