import { Request, Response } from "express";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import BoardDrizzleRepository from "../repositories/BoardDrizzleRepository.js";
import DeleteBoardCommand from "../../application/commands/DeleteBoardCommand.js";
import DeleteBoardCommandHandler from "../../application/handlers/DeleteBoardCommandHandler.js";
import BoardNotFoundException from "../../application/exceptions/BoardNotFoundException.js";
import InvalidUuidException from "../../../../shared/domain/exceptions/InvalidUuidException.js";
import UnauthorizedActionException from "../../../../shared/application/exceptions/UnauthorizedActionException.js";
import { eventBus } from "../../../../shared/infrastructure/dependencies.js";

type DeleteBoardDeleteParams = {
  id: string;
};

export default async function DeleteBoardDeleteController(req: Request<DeleteBoardDeleteParams>, res: Response) {
  const commandHandler = new DeleteBoardCommandHandler(new BoardDrizzleRepository(db), eventBus);

  try {
    if (!req.userId) {
      return res.status(401).send({ error: "UNAUTHORIZED", message: "User not authenticated" });
    }

    const command = new DeleteBoardCommand(req.params.id, req.userId);

    await commandHandler.execute(command);
    return res.sendStatus(204);
  } catch (ex) {
    if (ex instanceof BoardNotFoundException) {
      return res.status(404).send({
        error: "BOARD_NOT_FOUND",
        message: ex.message
      });
    }
    if (ex instanceof InvalidUuidException) {
      return res.status(400).send({
        error: "INVALID_UUID",
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
