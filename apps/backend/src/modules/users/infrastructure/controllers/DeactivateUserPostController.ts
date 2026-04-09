import { Request, Response } from "express";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import UserDrizzleRepository from "../repositories/UserDrizzleRepository.js";
import DeactivateUserCommand from "../../application/commands/DeactivateUserCommand.js";
import DeactivateUserCommandHandler from "../../application/handlers/DeactivateUserCommandHandler.js";
import UserNotFoundException from "../../application/exceptions/UserNotFoundException.js";
import UserAlreadyDeactivatedException from "../../application/exceptions/UserAlreadyDeactivatedException.js";
import InvalidUuidException from "../../../../shared/domain/exceptions/InvalidUuidException.js";

export default async function DeactivateUserPostController(req: Request, res: Response) {
  const commandHandler = new DeactivateUserCommandHandler(new UserDrizzleRepository(db));

  try {
    if (!req.userId) {
      return res.status(401).send({ error: "UNAUTHORIZED", message: "User not authenticated" });
    }

    if (req.userId !== req.params.id) {
      return res.status(403).send({
        error: "FORBIDDEN",
        message: "You are not allowed to deactivate this user"
      });
    }

    const command = new DeactivateUserCommand(req.params.id as string);

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
