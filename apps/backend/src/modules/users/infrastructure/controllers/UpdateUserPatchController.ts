import { Request, Response } from "express";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import UserDrizzleRepository from "../repositories/UserDrizzleRepository.js";
import UpdateUserCommand from "../../application/commands/UpdateUserCommand.js";
import UpdateUserCommandHandler from "../../application/handlers/UpdateUserCommandHandler.js";
import UserNotFoundException from "../../application/exceptions/UserNotFoundException.js";
import InvalidUuidException from "../../../../shared/domain/exceptions/InvalidUuidException.js";

type UpdateUserPatchParams = {
  id: string;
};

export default async function UpdateUserPatchController(req: Request<UpdateUserPatchParams>, res: Response) {
  const commandHandler = new UpdateUserCommandHandler(new UserDrizzleRepository(db));

  try {
    const command = new UpdateUserCommand(
      req.params.id,
      req.body.displayName,
      req.body.avatarUrl,
      req.body.emailVerified,
      req.body.isActive
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
