import { Request, Response } from "express";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import UserDrizzleRepository from "../repositories/UserDrizzleRepository.js";
import GetUserByEmailQuery from "../../application/queries/GetUserByEmailQuery.js";
import GetUserByEmailQueryHandler from "../../application/handlers/GetUserByEmailQueryHandler.js";
import UserNotFoundException from "../../application/exceptions/UserNotFoundException.js";
import InvalidEmailException from "../../domain/exceptions/InvalidEmailException.js";

export default async function GetUserByEmailGetController(req: Request, res: Response) {
  const queryHandler = new GetUserByEmailQueryHandler(new UserDrizzleRepository(db));

  try {
    const email = req.query.email;
    if (typeof email !== "string") {
      throw new InvalidEmailException(String(email));
    }
    const command = new GetUserByEmailQuery(email);

    const response = await queryHandler.execute(command);
    return res.status(200).json(response);
  } catch (ex) {
    if (ex instanceof UserNotFoundException) {
      return res.status(404).send({
        error: "USER_NOT_FOUND",
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
