import { Request, Response } from "express";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import UserDrizzleRepository from "../repositories/UserDrizzleRepository.js";
import UpdateUserCommand from "../../application/commands/UpdateUserCommand.js";
import UpdateUserCommandHandler from "../../application/handlers/UpdateUserCommandHandler.js";
import UserNotFoundException from "../../application/exceptions/UserNotFoundException.js";
import InvalidUuidException from "../../../../shared/domain/exceptions/InvalidUuidException.js";

export default async function UpdateUserPatchController(req: Request, res: Response) {
  const commandHandler = new UpdateUserCommandHandler(new UserDrizzleRepository(db));

  try {
    if (!req.userId) {
      return res.status(401).send({ error: "UNAUTHORIZED", message: "User not authenticated" });
    }

    if (req.userId !== req.params.id) {
      return res.status(403).send({
        error: "FORBIDDEN",
        message: "You are not allowed to update this user"
      });
    }

    const command = new UpdateUserCommand(
      req.params.id as string,
      req.body.displayName,
      req.body.avatarUrl,
      req.body.emailVerified
    );

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
