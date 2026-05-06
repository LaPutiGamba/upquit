import { Request, Response } from "express";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import BoardDrizzleRepository from "../repositories/BoardDrizzleRepository.js";
import GetPublicBoardsByUserIdQuery from "../../application/queries/GetPublicBoardsByUserIdQuery.js";
import GetPublicBoardsByUserIdQueryHandler from "../../application/handlers/GetPublicBoardsByUserIdQueryHandler.js";
import InvalidUuidException from "../../../../shared/domain/exceptions/InvalidUuidException.js";

export default async function GetPublicBoardsByUserGetController(req: Request, res: Response) {
  const queryHandler = new GetPublicBoardsByUserIdQueryHandler(new BoardDrizzleRepository(db));

  try {
    const userId = req.params.userId as string;

    const query = new GetPublicBoardsByUserIdQuery(userId);
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
