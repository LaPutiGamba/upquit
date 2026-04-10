import { Request, Response } from "express";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import BoardDrizzleRepository from "../repositories/BoardDrizzleRepository.js";
import GetBoardsByUserIdQuery from "../../application/queries/GetBoardsByUserIdQuery.js";
import GetBoardsByUserIdQueryHandler from "../../application/handlers/GetBoardsByUserIdQueryHandler.js";
import InvalidUuidException from "../../../../shared/domain/exceptions/InvalidUuidException.js";

export default async function GetBoardsByUserGetController(req: Request, res: Response) {
  const queryHandler = new GetBoardsByUserIdQueryHandler(new BoardDrizzleRepository(db));

  try {
    if (!req.userId) {
      return res.status(401).send({ error: "UNAUTHORIZED", message: "User not authenticated" });
    }

    const query = new GetBoardsByUserIdQuery(req.userId);
    const response = await queryHandler.execute(query);
    return res.status(200).json(response);
  } catch (ex) {
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
