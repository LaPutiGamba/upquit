import { Request, Response } from "express";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import RequestDrizzleRepository from "../repositories/RequestDrizzleRepository.js";
import GetRequestByIdQuery from "../../application/queries/GetRequestByIdQuery.js";
import GetRequestByIdQueryHandler from "../../application/handlers/GetRequestByIdQueryHandler.js";
import RequestNotFoundException from "../../application/exceptions/RequestNotFoundException.js";
import InvalidUuidException from "../../../../shared/domain/exceptions/InvalidUuidException.js";

type GetRequestByIdGetParams = {
  id: string;
};

export default async function GetRequestByIdGetController(req: Request<GetRequestByIdGetParams>, res: Response) {
  const queryHandler = new GetRequestByIdQueryHandler(new RequestDrizzleRepository(db));

  try {
    const command = new GetRequestByIdQuery(req.params.id);

    const response = await queryHandler.execute(command);
    return res.status(200).json(response);
  } catch (ex) {
    if (ex instanceof RequestNotFoundException) {
      return res.status(404).send({
        error: "REQUEST_NOT_FOUND",
        message: ex.message
      });
    }
    if (ex instanceof InvalidUuidException) {
      return res.status(400).send({
        error: "INVALID_REQUEST_ID",
        message: ex.message
      });
    }

    console.error(ex);
    return res.sendStatus(500);
  }
}
