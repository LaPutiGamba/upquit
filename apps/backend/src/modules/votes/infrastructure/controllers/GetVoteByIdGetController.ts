import { Request, Response } from "express";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import VoteDrizzleRepository from "../repositories/VoteDrizzleRepository.js";
import GetVoteByIdQuery from "../../application/queries/GetVoteByIdQuery.js";
import GetVoteByIdQueryHandler from "../../application/handlers/GetVoteByIdQueryHandler.js";
import VoteNotFoundException from "../../application/exceptions/VoteNotFoundException.js";
import InvalidUuidException from "../../../../shared/domain/exceptions/InvalidUuidException.js";

type GetVoteByIdGetParams = {
  id: string;
};

export default async function GetVoteByIdGetController(req: Request<GetVoteByIdGetParams>, res: Response) {
  const queryHandler = new GetVoteByIdQueryHandler(new VoteDrizzleRepository(db));

  try {
    const command = new GetVoteByIdQuery(req.params.id);

    const response = await queryHandler.execute(command);
    return res.status(200).json(response);
  } catch (ex) {
    if (ex instanceof VoteNotFoundException) {
      return res.status(404).send({
        error: "VOTE_NOT_FOUND",
        message: ex.message
      });
    }
    if (ex instanceof InvalidUuidException) {
      return res.status(400).send({
        error: "INVALID_VOTE_ID",
        message: ex.message
      });
    }

    console.error(ex);
    return res.sendStatus(500);
  }
}
