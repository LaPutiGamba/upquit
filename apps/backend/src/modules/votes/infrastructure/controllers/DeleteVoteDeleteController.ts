import { Request, Response } from "express";

import DeleteVoteCommand from "../../application/commands/DeleteVoteCommand.js";
import DeleteVoteCommandHandler from "../../application/handlers/DeleteVoteCommandHandler.js";
import VoteNotFoundException from "../../application/exceptions/VoteNotFoundException.js";
import InvalidUuidException from "../../../../shared/domain/exceptions/InvalidUuidException.js";
import UnauthorizedActionException from "../../../../shared/application/exceptions/UnauthorizedActionException.js";

export default async function DeleteVoteDeleteController(
  req: Request,
  res: Response,
  commandHandler: DeleteVoteCommandHandler
) {
  try {
    if (!req.userId) {
      return res.status(401).send({ error: "UNAUTHORIZED", message: "User not authenticated" });
    }

    const command = new DeleteVoteCommand(req.params.id as string, req.userId);

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
    if (ex instanceof UnauthorizedActionException) {
      return res.status(403).send({
        error: "FORBIDDEN",
        message: ex.message
      });
    }

    console.error(ex);
    return res.sendStatus(500);
  }
}
