import { Request, Response } from "express";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import CommentDrizzleRepository from "../repositories/CommentDrizzleRepository.js";
import DeleteCommentCommand from "../../application/commands/DeleteCommentCommand.js";
import DeleteCommentCommandHandler from "../../application/handlers/DeleteCommentCommandHandler.js";
import CommentNotFoundException from "../../application/exceptions/CommentNotFoundException.js";
import InvalidUuidException from "../../../../shared/domain/exceptions/InvalidUuidException.js";
import WebSocketRealtimePublisher from "../../../../shared/infrastructure/services/WebSocketRealtimePublisher.js";
import { getWebSocketServer } from "../../../../shared/infrastructure/websocket/WebSocketServerRegistry.js";

type DeleteCommentDeleteParams = {
  id: string;
};

export default async function DeleteCommentDeleteController(req: Request<DeleteCommentDeleteParams>, res: Response) {
  const commandHandler = new DeleteCommentCommandHandler(
    new CommentDrizzleRepository(db),
    new WebSocketRealtimePublisher(getWebSocketServer())
  );

  try {
    const command = new DeleteCommentCommand(req.params.id);

    await commandHandler.execute(command);
    return res.sendStatus(204);
  } catch (ex) {
    if (ex instanceof CommentNotFoundException) {
      return res.status(404).send({
        error: "COMMENT_NOT_FOUND",
        message: ex.message
      });
    }
    if (ex instanceof InvalidUuidException) {
      return res.status(400).send({
        error: "INVALID_COMMENT_ID",
        message: ex.message
      });
    }

    console.error(ex);
    return res.sendStatus(500);
  }
}
