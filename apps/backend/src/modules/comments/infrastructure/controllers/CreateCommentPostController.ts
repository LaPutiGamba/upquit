import { Request, Response } from "express";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import CommentDrizzleRepository from "../repositories/CommentDrizzleRepository.js";
import CreateCommentCommand from "../../application/commands/CreateCommentCommand.js";
import CreateCommentCommandHandler from "../../application/handlers/CreateCommentCommandHandler.js";
import InvalidUuidException from "../../../../shared/domain/exceptions/InvalidUuidException.js";

export default async function CreateCommentPostController(req: Request, res: Response) {
  const commandHandler = new CreateCommentCommandHandler(new CommentDrizzleRepository(db));

  try {
    const command = new CreateCommentCommand(
      req.body.requestId,
      req.body.userId,
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
