import { Request, Response } from "express";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import VoteDrizzleRepository from "../repositories/VoteDrizzleRepository.js";
import GetVoteCountByRequestIdQuery from "../../application/queries/GetVoteCountByRequestIdQuery.js";
import GetVoteCountByRequestIdQueryHandler from "../../application/handlers/GetVoteCountByRequestIdQueryHandler.js";
import InvalidUuidException from "../../../../shared/domain/exceptions/InvalidUuidException.js";

export default async function GetVoteCountByRequestIdGetController(req: Request, res: Response) {
  const queryHandler = new GetVoteCountByRequestIdQueryHandler(new VoteDrizzleRepository(db));

  try {
    const requestId = req.query.requestId;
    if (typeof requestId !== "string") {
      throw new InvalidUuidException(String(requestId));
    }

    const command = new GetVoteCountByRequestIdQuery(requestId);

    const count = await queryHandler.execute(command);
    return res.status(200).json({ count });
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
