import { Request, Response } from "express";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import CommentDrizzleRepository from "../repositories/CommentDrizzleRepository.js";
import CreateCommentCommand from "../../application/commands/CreateCommentCommand.js";
import CreateCommentCommandHandler from "../../application/handlers/CreateCommentCommandHandler.js";
import InvalidUuidException from "../../../../shared/domain/exceptions/InvalidUuidException.js";
import WebSocketRealtimePublisher from "../../../../shared/infrastructure/services/WebSocketRealtimePublisher.js";
import { eventBus } from "../../../../shared/infrastructure/dependencies.js";

export default async function CreateCommentPostController(req: Request, res: Response) {
  const commandHandler = new CreateCommentCommandHandler(
    new CommentDrizzleRepository(db),
    new WebSocketRealtimePublisher(),
    eventBus
  );

  try {
    if (!req.userId) {
      return res.status(401).send({ error: "UNAUTHORIZED", message: "User not authenticated" });
    }

    const command = new CreateCommentCommand(
      req.body.requestId,
      req.userId,
      req.body.content,
      req.body.parentId ?? null,
      req.body.isAdminReply ?? null
    );

    const response = await commandHandler.execute(command);
    return res.status(201).json(response);
  } catch (ex) {
    if (ex instanceof InvalidUuidException) {
      return res.status(400).send({
        error: "INVALID_COMMENT_REFERENCE_ID",
        message: ex.message
      });
    }

    console.error(ex);
    return res.sendStatus(500);
  }
}
