import { Request, Response } from "express";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import BoardDrizzleRepository from "../repositories/BoardDrizzleRepository.js";
import GetBoardByIdQuery from "../../application/queries/GetBoardByIdQuery.js";
import GetBoardByIdQueryHandler from "../../application/handlers/GetBoardByIdQueryHandler.js";
import BoardNotFoundException from "../../application/exceptions/BoardNotFoundException.js";
import InvalidUuidException from "../../../../shared/domain/exceptions/InvalidUuidException.js";

type GetBoardByIdGetParams = {
  id: string;
};

export default async function GetBoardByIdGetController(req: Request<GetBoardByIdGetParams>, res: Response) {
  const queryHandler = new GetBoardByIdQueryHandler(new BoardDrizzleRepository(db));

  try {
    const command = new GetBoardByIdQuery(req.params.id);

    const response = await queryHandler.execute(command);
    return res.status(200).json(response);
  } catch (ex) {
    if (ex instanceof BoardNotFoundException) {
      return res.status(404).send({
        error: "BOARD_NOT_FOUND",
        message: ex.message
      });
    }
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
