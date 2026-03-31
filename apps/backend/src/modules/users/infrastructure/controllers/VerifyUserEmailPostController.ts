import { Request, Response } from "express";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import UserDrizzleRepository from "../repositories/UserDrizzleRepository.js";
import VerifyUserEmailCommand from "../../application/commands/VerifyUserEmailCommand.js";
import VerifyUserEmailCommandHandler from "../../application/handlers/VerifyUserEmailCommandHandler.js";
import UserNotFoundException from "../../application/exceptions/UserNotFoundException.js";
import InvalidUuidException from "../../../../shared/domain/exceptions/InvalidUuidException.js";

type VerifyUserEmailPostParams = {
  id: string;
};

export default async function VerifyUserEmailPostController(req: Request<VerifyUserEmailPostParams>, res: Response) {
  const commandHandler = new VerifyUserEmailCommandHandler(new UserDrizzleRepository(db));

  try {
    const command = new VerifyUserEmailCommand(req.params.id);

    const response = await commandHandler.execute(command);
    return res.status(200).json(response);
  } catch (ex) {
    if (ex instanceof UserNotFoundException) {
      return res.status(404).send({
        error: "USER_NOT_FOUND",
        message: ex.message
      });
    }
    if (ex instanceof InvalidUuidException) {
      return res.status(400).send({
        error: "INVALID_USER_ID",
        message: ex.message
      });
    }

    console.error(ex);
    return res.sendStatus(500);
  }
}
