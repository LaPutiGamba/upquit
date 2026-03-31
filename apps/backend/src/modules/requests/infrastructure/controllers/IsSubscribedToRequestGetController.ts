import { Request, Response } from "express";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import RequestDrizzleRepository from "../repositories/RequestDrizzleRepository.js";
import IsSubscribedToRequestQuery from "../../application/queries/IsSubscribedToRequestQuery.js";
import IsSubscribedToRequestQueryHandler from "../../application/handlers/IsSubscribedToRequestQueryHandler.js";
import RequestNotFoundException from "../../application/exceptions/RequestNotFoundException.js";
import InvalidUuidException from "../../../../shared/domain/exceptions/InvalidUuidException.js";

type IsSubscribedToRequestGetParams = {
  id: string;
};

export default async function IsSubscribedToRequestGetController(
  req: Request<IsSubscribedToRequestGetParams>,
  res: Response
) {
  const queryHandler = new IsSubscribedToRequestQueryHandler(new RequestDrizzleRepository(db));

  try {
    const userId = req.query.userId;
    if (typeof userId !== "string") {
      throw new InvalidUuidException(String(userId));
    }

    const command = new IsSubscribedToRequestQuery(userId, req.params.id);

    const isSubscribed = await queryHandler.execute(command);
    return res.status(200).json({ isSubscribed });
  } catch (ex) {
    if (ex instanceof RequestNotFoundException) {
      return res.status(404).send({
        error: "REQUEST_NOT_FOUND",
        message: ex.message
      });
    }
    if (ex instanceof InvalidUuidException) {
      return res.status(400).send({
        error: "INVALID_SUBSCRIPTION_REFERENCE_ID",
        message: ex.message
      });
    }

    console.error(ex);
    return res.sendStatus(500);
  }
}
