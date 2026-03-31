import { Request, Response } from "express";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import VoteDrizzleRepository from "../repositories/VoteDrizzleRepository.js";
import DeleteVoteCommand from "../../application/commands/DeleteVoteCommand.js";
import DeleteVoteCommandHandler from "../../application/handlers/DeleteVoteCommandHandler.js";
import VoteNotFoundException from "../../application/exceptions/VoteNotFoundException.js";
import InvalidUuidException from "../../../../shared/domain/exceptions/InvalidUuidException.js";

type DeleteVoteDeleteParams = {
  id: string;
};

export default async function DeleteVoteDeleteController(req: Request<DeleteVoteDeleteParams>, res: Response) {
  const commandHandler = new DeleteVoteCommandHandler(new VoteDrizzleRepository(db));

  try {
    const command = new DeleteVoteCommand(req.params.id);

    await commandHandler.execute(command);
    return res.sendStatus(204);
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
