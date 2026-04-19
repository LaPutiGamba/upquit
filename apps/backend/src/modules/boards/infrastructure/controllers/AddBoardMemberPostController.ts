import { Request, Response } from "express";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import BoardDrizzleRepository from "../repositories/BoardDrizzleRepository.js";
import AddBoardMemberCommand from "../../application/commands/AddBoardMemberCommand.js";
import AddBoardMemberCommandHandler from "../../application/handlers/AddBoardMemberCommandHandler.js";
import BoardNotFoundException from "../../application/exceptions/BoardNotFoundException.js";
import InvalidUuidException from "../../../../shared/domain/exceptions/InvalidUuidException.js";
import UnauthorizedActionException from "../../../../shared/application/exceptions/UnauthorizedActionException.js";
import BoardMemberAlreadyExistsException from "../../application/exceptions/BoardMemberAlreadyExistsException.js";
import InvalidEmailException from "../../../users/domain/exceptions/InvalidEmailException.js";
import UserDrizzleRepository from "../../../users/infrastructure/repositories/UserDrizzleRepository.js";
import GetUserByEmailQuery from "../../../users/application/queries/GetUserByEmailQuery.js";
import GetUserByEmailQueryHandler from "../../../users/application/handlers/GetUserByEmailQueryHandler.js";
import UserNotFoundException from "../../../users/application/exceptions/UserNotFoundException.js";

export default async function AddBoardMemberPostController(req: Request, res: Response) {
  const commandHandler = new AddBoardMemberCommandHandler(new BoardDrizzleRepository(db));
  const userQueryHandler = new GetUserByEmailQueryHandler(new UserDrizzleRepository(db));

  try {
    if (!req.userId) {
      return res.status(401).send({ error: "UNAUTHORIZED", message: "User not authenticated" });
    }

    const email = req.body.email;
    if (typeof email !== "string") {
      throw new InvalidEmailException(String(email));
    }

    const targetUser = await userQueryHandler.execute(new GetUserByEmailQuery(email));
    const command = new AddBoardMemberCommand(
      req.params.id as string,
      targetUser.id,
      req.body.role ?? "member",
      req.userId
    );

    await commandHandler.execute(command);
    return res.sendStatus(204);
  } catch (ex) {
    if (ex instanceof BoardNotFoundException) {
      return res.status(404).send({
        error: "BOARD_NOT_FOUND",
        message: ex.message
      });
    }
    if (ex instanceof UserNotFoundException) {
      return res.status(404).send({
        error: "USER_NOT_FOUND",
        message: ex.message
      });
    }
    if (ex instanceof InvalidUuidException) {
      return res.status(400).send({
        error: "INVALID_UUID",
        message: ex.message
      });
    }
    if (ex instanceof InvalidEmailException) {
      return res.status(400).send({
        error: "INVALID_EMAIL",
        message: ex.message
      });
    }
    if (ex instanceof UnauthorizedActionException) {
      return res.status(403).send({
        error: "FORBIDDEN",
        message: ex.message
      });
    }
    if (ex instanceof BoardMemberAlreadyExistsException) {
      return res.status(409).send({
        error: "BOARD_MEMBER_ALREADY_EXISTS",
        message: ex.message
      });
    }

    console.error(ex);
    return res.sendStatus(500);
  }
}
