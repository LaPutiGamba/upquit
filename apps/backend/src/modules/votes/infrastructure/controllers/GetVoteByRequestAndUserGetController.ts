import { Request, Response } from "express";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import VoteDrizzleRepository from "../repositories/VoteDrizzleRepository.js";
import GetVoteByRequestAndUserQuery from "../../application/queries/GetVoteByRequestAndUserQuery.js";
import GetVoteByRequestAndUserQueryHandler from "../../application/handlers/GetVoteByRequestAndUserQueryHandler.js";
import VoteNotFoundException from "../../application/exceptions/VoteNotFoundException.js";
import InvalidUuidException from "../../../../shared/domain/exceptions/InvalidUuidException.js";

export default async function GetVoteByRequestAndUserGetController(req: Request, res: Response) {
  const queryHandler = new GetVoteByRequestAndUserQueryHandler(new VoteDrizzleRepository(db));

  try {
    const requestId = req.query.requestId;
    const userId = req.query.userId;

    if (typeof requestId !== "string" || typeof userId !== "string") {
      throw new InvalidUuidException(`${String(requestId)}:${String(userId)}`);
    }

    const command = new GetVoteByRequestAndUserQuery(requestId, userId);

    const response = await queryHandler.execute(command);
    return res.status(200).json(response);
  } catch (ex) {
    if (ex instanceof VoteNotFoundException) {
      return res.sendStatus(204);
    }
    if (ex instanceof InvalidUuidException) {
      return res.status(400).send({
        error: "INVALID_VOTE_REFERENCE_ID",
        message: ex.message
      });
    }

    console.error(ex);
    return res.sendStatus(500);
  }
}
