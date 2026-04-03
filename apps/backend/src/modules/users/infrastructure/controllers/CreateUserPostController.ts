import { Request, Response } from "express";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import UserDrizzleRepository from "../repositories/UserDrizzleRepository.js";
import BcryptPasswordHasher from "../services/BcryptPasswordHasher.js";
import CreateUserCommand from "../../application/commands/CreateUserCommand.js";
import CreateUserCommandHandler from "../../application/handlers/CreateUserCommandHandler.js";
import UserAlreadyExistsException from "../../application/exceptions/UserAlreadyExistsException.js";
import InvalidEmailException from "../../domain/exceptions/InvalidEmailException.js";

export default async function CreateUserPostController(req: Request, res: Response) {
  const commandHandler = new CreateUserCommandHandler(new UserDrizzleRepository(db), new BcryptPasswordHasher());

  try {
    const command = new CreateUserCommand(
      req.body.email,
      req.body.displayName,
      req.body.password ?? null,
      req.body.oauthProvider ?? null,
      req.body.oauthId ?? null,
      req.body.avatarUrl ?? null
    );

    const response = await commandHandler.execute(command);
    return res.status(201).json(response);
  } catch (ex) {
    if (ex instanceof UserAlreadyExistsException) {
      return res.status(409).send({
        error: "USER_ALREADY_EXISTS",
        message: ex.message
      });
    }
    if (ex instanceof InvalidEmailException) {
      return res.status(400).send({
        error: "INVALID_EMAIL",
        message: ex.message
      });
    }

    console.error(ex);
    return res.sendStatus(500);
  }
}
