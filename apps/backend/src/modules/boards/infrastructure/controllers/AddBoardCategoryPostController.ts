import { Request, Response } from "express";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import BoardDrizzleRepository from "../repositories/BoardDrizzleRepository.js";
import AddBoardCategoryCommand from "../../application/commands/AddBoardCategoryCommand.js";
import AddBoardCategoryCommandHandler from "../../application/handlers/AddBoardCategoryCommandHandler.js";
import BoardNotFoundException from "../../application/exceptions/BoardNotFoundException.js";
import InvalidUuidException from "../../../../shared/domain/exceptions/InvalidUuidException.js";

type AddBoardCategoryPostParams = {
  id: string;
};

export default async function AddBoardCategoryPostController(req: Request<AddBoardCategoryPostParams>, res: Response) {
  const commandHandler = new AddBoardCategoryCommandHandler(new BoardDrizzleRepository(db));

  try {
    const command = new AddBoardCategoryCommand(req.params.id, req.body.name);

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
        error: "INVALID_BOARD_ID",
        message: ex.message
      });
    }

    console.error(ex);
    return res.sendStatus(500);
  }
}
