import { Request, Response } from "express";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import UserDrizzleRepository from "../repositories/UserDrizzleRepository.js";
import GetUsernameAvailabilityQuery from "../../application/queries/GetUsernameAvailabilityQuery.js";
import GetUsernameAvailabilityQueryHandler from "../../application/handlers/GetUsernameAvailabilityQueryHandler.js";
import Username from "../../domain/value-objects/Username.js";
import InvalidUsernameException from "../../domain/exceptions/InvalidUsernameException.js";

export default async function GetUsernameAvailabilityGetController(req: Request, res: Response) {
  const queryHandler = new GetUsernameAvailabilityQueryHandler(new UserDrizzleRepository(db));

  try {
    const username = req.query.username;
    if (typeof username !== "string") {
      throw new InvalidUsernameException(String(username));
    }

    new Username(username);

    const response = await queryHandler.execute(new GetUsernameAvailabilityQuery(username));
    return res.status(200).json(response);
  } catch (ex) {
    if (ex instanceof InvalidUsernameException) {
      return res.status(400).send({
        error: "INVALID_USERNAME",
        message: ex.message
      });
    }

    console.error(ex);
    return res.sendStatus(500);
  }
}
