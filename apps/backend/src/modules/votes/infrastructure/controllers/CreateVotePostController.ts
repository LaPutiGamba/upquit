import { Request, Response } from "express";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import VoteDrizzleRepository from "../repositories/VoteDrizzleRepository.js";
import CreateVoteCommand from "../../application/commands/CreateVoteCommand.js";
import CreateVoteCommandHandler from "../../application/handlers/CreateVoteCommandHandler.js";
import VoteAlreadyExistsException from "../../application/exceptions/VoteAlreadyExistsException.js";
import InvalidUuidException from "../../../../shared/domain/exceptions/InvalidUuidException.js";
import WebSocketRealtimePublisher from "../../../../shared/infrastructure/services/WebSocketRealtimePublisher.js";
import { getWebSocketServer } from "../../../../shared/infrastructure/websocket/WebSocketServerRegistry.js";

export default async function CreateVotePostController(req: Request, res: Response) {
  const commandHandler = new CreateVoteCommandHandler(
    new VoteDrizzleRepository(db),
    new WebSocketRealtimePublisher(getWebSocketServer())
  );

  try {
    const command = new CreateVoteCommand(req.body.requestId, req.body.userId, req.body.boardId);

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
