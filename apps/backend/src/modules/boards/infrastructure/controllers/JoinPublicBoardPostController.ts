import { Request, Response } from "express";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import BoardDrizzleRepository from "../repositories/BoardDrizzleRepository.js";
import JoinPublicBoardCommand from "../../application/commands/JoinPublicBoardCommand.js";
import JoinPublicBoardCommandHandler from "../../application/handlers/JoinPublicBoardCommandHandler.js";
import BoardNotFoundException from "../../application/exceptions/BoardNotFoundException.js";
import BoardIsPrivateException from "../../application/exceptions/BoardIsPrivateException.js";
import InvalidUuidException from "../../../../shared/domain/exceptions/InvalidUuidException.js";

export default async function JoinPublicBoardPostController(req: Request, res: Response) {
  const commandHandler = new JoinPublicBoardCommandHandler(new BoardDrizzleRepository(db));

  try {
    if (!req.userId) {
      return res.status(401).send({ error: "UNAUTHORIZED", message: "User not authenticated" });
    }

    const command = new JoinPublicBoardCommand(req.params.id as string, req.userId);
    await commandHandler.execute(command);

    return res.sendStatus(204);
  } catch (ex) {
    if (ex instanceof BoardNotFoundException) {
      return res.status(404).send({
        error: "BOARD_NOT_FOUND",
        message: ex.message
      });
    }
    if (ex instanceof BoardIsPrivateException) {
      return res.status(403).send({
        error: "BOARD_IS_PRIVATE",
        message: ex.message
      });
    }
    if (ex instanceof InvalidUuidException) {
      return res.status(400).send({
        error: "INVALID_UUID",
        message: ex.message
      });
    }

    console.error(ex);
    return res.sendStatus(500);
  }
}
