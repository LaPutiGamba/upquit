import { Request, Response } from "express";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import UserDrizzleRepository from "../repositories/UserDrizzleRepository.js";
import DeactivateUserCommand from "../../application/commands/DeactivateUserCommand.js";
import DeactivateUserCommandHandler from "../../application/handlers/DeactivateUserCommandHandler.js";
import UserNotFoundException from "../../application/exceptions/UserNotFoundException.js";
import UserAlreadyDeactivatedException from "../../application/exceptions/UserAlreadyDeactivatedException.js";
import InvalidUuidException from "../../../../shared/domain/exceptions/InvalidUuidException.js";

type DeactivateUserPostParams = {
  id: string;
};

export default async function DeactivateUserPostController(req: Request<DeactivateUserPostParams>, res: Response) {
  const commandHandler = new DeactivateUserCommandHandler(new UserDrizzleRepository(db));

  try {
    const command = new DeactivateUserCommand(req.params.id);

    const response = await commandHandler.execute(command);
    return res.status(200).json(response);
  } catch (ex) {
    if (ex instanceof UserNotFoundException) {
      return res.status(404).send({
        error: "USER_NOT_FOUND",
        message: ex.message
      });
    }
    if (ex instanceof UserAlreadyDeactivatedException) {
      return res.status(409).send({
        error: "USER_ALREADY_DEACTIVATED",
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
