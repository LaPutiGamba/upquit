import { Request, Response } from "express";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import RequestDrizzleRepository from "../repositories/RequestDrizzleRepository.js";
import GetRequestChangelogByRequestIdQuery from "../../application/queries/GetRequestChangelogByRequestIdQuery.js";
import GetRequestChangelogByRequestIdQueryHandler from "../../application/handlers/GetRequestChangelogByRequestIdQueryHandler.js";
import InvalidUuidException from "../../../../shared/domain/exceptions/InvalidUuidException.js";

type GetRequestChangelogGetParams = {
  id: string;
};

export default async function GetRequestChangelogGetController(
  req: Request<GetRequestChangelogGetParams>,
  res: Response
) {
  const queryHandler = new GetRequestChangelogByRequestIdQueryHandler(new RequestDrizzleRepository(db));

  try {
    const command = new GetRequestChangelogByRequestIdQuery(req.params.id);

    const response = await queryHandler.execute(command);
    return res.status(200).json(response);
  } catch (ex) {
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
