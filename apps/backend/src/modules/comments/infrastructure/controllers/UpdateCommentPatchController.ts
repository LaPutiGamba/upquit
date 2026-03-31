import { Request, Response } from "express";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import CommentDrizzleRepository from "../repositories/CommentDrizzleRepository.js";
import UpdateCommentCommand from "../../application/commands/UpdateCommentCommand.js";
import UpdateCommentCommandHandler from "../../application/handlers/UpdateCommentCommandHandler.js";
import CommentNotFoundException from "../../application/exceptions/CommentNotFoundException.js";
import InvalidUuidException from "../../../../shared/domain/exceptions/InvalidUuidException.js";
import WebSocketRealtimePublisher from "../../../../shared/infrastructure/services/WebSocketRealtimePublisher.js";
import { getWebSocketServer } from "../../../../shared/infrastructure/websocket/WebSocketServerRegistry.js";

type UpdateCommentPatchParams = {
  id: string;
};

export default async function UpdateCommentPatchController(req: Request<UpdateCommentPatchParams>, res: Response) {
  const commandHandler = new UpdateCommentCommandHandler(
    new CommentDrizzleRepository(db),
    new WebSocketRealtimePublisher(getWebSocketServer())
  );

  try {
    const command = new UpdateCommentCommand(req.params.id, req.body.content, req.body.isAdminReply);

    const response = await commandHandler.execute(command);
    return res.status(200).json(response);
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
