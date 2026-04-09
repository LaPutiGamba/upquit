import { Request, Response } from "express";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import BoardDrizzleRepository from "../repositories/BoardDrizzleRepository.js";
import AddBoardMemberCommand from "../../application/commands/AddBoardMemberCommand.js";
import AddBoardMemberCommandHandler from "../../application/handlers/AddBoardMemberCommandHandler.js";
import BoardNotFoundException from "../../application/exceptions/BoardNotFoundException.js";
import InvalidUuidException from "../../../../shared/domain/exceptions/InvalidUuidException.js";

export default async function AddBoardMemberPostController(req: Request, res: Response) {
  const commandHandler = new AddBoardMemberCommandHandler(new BoardDrizzleRepository(db));

  try {
    if (!req.userId) {
      return res.status(401).send({ error: "UNAUTHORIZED", message: "User not authenticated" });
    }

    const command = new AddBoardMemberCommand(req.params.id as string, req.body.userId, req.body.role);

    const response = await commandHandler.execute(command);
    return res.status(201).json(response);
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

    console.error(ex);
    return res.sendStatus(500);
  }
}
