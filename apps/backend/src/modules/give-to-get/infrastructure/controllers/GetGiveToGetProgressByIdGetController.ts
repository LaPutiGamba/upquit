import { Request, Response } from "express";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import GiveToGetProgressDrizzleRepository from "../repositories/GiveToGetProgressDrizzleRepository.js";
import GetGiveToGetProgressByIdQuery from "../../application/queries/GetGiveToGetProgressByIdQuery.js";
import GetGiveToGetProgressByIdQueryHandler from "../../application/handlers/GetGiveToGetProgressByIdQueryHandler.js";
import GiveToGetProgressNotFoundException from "../../application/exceptions/GiveToGetProgressNotFoundException.js";
import InvalidUuidException from "../../../../shared/domain/exceptions/InvalidUuidException.js";

type GetGiveToGetProgressByIdGetParams = {
  id: string;
};

export default async function GetGiveToGetProgressByIdGetController(
  req: Request<GetGiveToGetProgressByIdGetParams>,
  res: Response
) {
  const queryHandler = new GetGiveToGetProgressByIdQueryHandler(new GiveToGetProgressDrizzleRepository(db));

  try {
    const command = new GetGiveToGetProgressByIdQuery(req.params.id);

    const response = await queryHandler.execute(command);
    return res.status(200).json(response);
  } catch (ex) {
    if (ex instanceof GiveToGetProgressNotFoundException) {
      return res.status(404).send({
        error: "GIVE_TO_GET_PROGRESS_NOT_FOUND",
        message: ex.message
      });
    }
    if (ex instanceof InvalidUuidException) {
      return res.status(400).send({
        error: "INVALID_GIVE_TO_GET_PROGRESS_ID",
        message: ex.message
      });
    }

    console.error(ex);
    return res.sendStatus(500);
  }
}
