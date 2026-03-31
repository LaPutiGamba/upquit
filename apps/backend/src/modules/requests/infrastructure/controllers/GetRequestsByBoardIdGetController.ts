import { Request, Response } from "express";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import RequestDrizzleRepository from "../repositories/RequestDrizzleRepository.js";
import GetRequestsByBoardIdQuery from "../../application/queries/GetRequestsByBoardIdQuery.js";
import GetRequestsByBoardIdQueryHandler from "../../application/handlers/GetRequestsByBoardIdQueryHandler.js";
import InvalidUuidException from "../../../../shared/domain/exceptions/InvalidUuidException.js";

export default async function GetRequestsByBoardIdGetController(req: Request, res: Response) {
  const queryHandler = new GetRequestsByBoardIdQueryHandler(new RequestDrizzleRepository(db));

  try {
    const boardId = req.query.boardId;
    if (typeof boardId !== "string") {
      throw new InvalidUuidException(String(boardId));
    }

    const command = new GetRequestsByBoardIdQuery(boardId);

    const response = await queryHandler.execute(command);
    return res.status(200).json(response);
  } catch (ex) {
    if (ex instanceof InvalidUuidException) {
      return res.status(400).send({
        error: "INVALID_BOARD_ID",
        message: ex.message
      });
    }

    console.error(ex);
    return res.sendStatus(500);
  }
}
