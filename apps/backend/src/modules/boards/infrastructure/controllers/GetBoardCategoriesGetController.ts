import { Request, Response } from "express";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import BoardDrizzleRepository from "../repositories/BoardDrizzleRepository.js";
import GetBoardCategoriesByBoardIdQuery from "../../application/queries/GetBoardCategoriesByBoardIdQuery.js";
import GetBoardCategoriesByBoardIdQueryHandler from "../../application/handlers/GetBoardCategoriesByBoardIdQueryHandler.js";
import BoardNotFoundException from "../../application/exceptions/BoardNotFoundException.js";
import InvalidUuidException from "../../../../shared/domain/exceptions/InvalidUuidException.js";

type GetBoardCategoriesGetParams = {
  id: string;
};

export default async function GetBoardCategoriesGetController(
  req: Request<GetBoardCategoriesGetParams>,
  res: Response
) {
  const queryHandler = new GetBoardCategoriesByBoardIdQueryHandler(new BoardDrizzleRepository(db));

  try {
    const command = new GetBoardCategoriesByBoardIdQuery(req.params.id);

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
