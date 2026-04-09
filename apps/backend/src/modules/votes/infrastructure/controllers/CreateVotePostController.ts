import { Request, Response } from "express";

import CreateVoteCommand from "../../application/commands/CreateVoteCommand.js";
import CreateVoteCommandHandler from "../../application/handlers/CreateVoteCommandHandler.js";
import VoteAlreadyExistsException from "../../application/exceptions/VoteAlreadyExistsException.js";
import InvalidUuidException from "../../../../shared/domain/exceptions/InvalidUuidException.js";

export default async function CreateVotePostController(
  req: Request,
  res: Response,
  commandHandler: CreateVoteCommandHandler
) {
  try {
    if (!req.userId) {
      return res.status(401).send({ error: "UNAUTHORIZED", message: "User not authenticated" });
    }

    const command = new CreateVoteCommand(req.body.requestId, req.userId, req.body.boardId);

    const response = await commandHandler.execute(command);
    return res.status(201).json(response);
  } catch (ex) {
    if (ex instanceof VoteAlreadyExistsException) {
      return res.status(409).send({
        error: "VOTE_ALREADY_EXISTS",
        message: ex.message
      });
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
