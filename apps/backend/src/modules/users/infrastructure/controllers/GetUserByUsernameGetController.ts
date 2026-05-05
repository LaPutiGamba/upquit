import { Request, Response } from "express";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import UserDrizzleRepository from "../repositories/UserDrizzleRepository.js";
import GetUserByUsernameQuery from "../../application/queries/GetUserByUsernameQuery.js";
import GetUserByUsernameQueryHandler from "../../application/handlers/GetUserByUsernameQueryHandler.js";
import UserNotFoundException from "../../application/exceptions/UserNotFoundException.js";

export default async function GetUserByUsernameGetController(req: Request, res: Response) {
  const queryHandler = new GetUserByUsernameQueryHandler(new UserDrizzleRepository(db));

  try {
    const username = req.params.username as string;

    if (!username || username.trim().length === 0) {
      return res.status(400).send({
        error: "INVALID_USERNAME",
        message: "Username is required"
      });
    }

    const query = new GetUserByUsernameQuery(username);
    const response = await queryHandler.execute(query);
    return res.status(200).json(response);
  } catch (ex) {
    if (ex instanceof UserNotFoundException) {
      return res.status(404).send({
        error: "USER_NOT_FOUND",
        message: ex.message
      });
    }

    console.error(ex);
    return res.sendStatus(500);
  }
}
