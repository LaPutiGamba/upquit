import { Request, Response } from "express";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import RequestDrizzleRepository from "../repositories/RequestDrizzleRepository.js";
import UnsubscribeFromRequestCommand from "../../application/commands/UnsubscribeFromRequestCommand.js";
import UnsubscribeFromRequestCommandHandler from "../../application/handlers/UnsubscribeFromRequestCommandHandler.js";
import RequestNotFoundException from "../../application/exceptions/RequestNotFoundException.js";
import InvalidUuidException from "../../../../shared/domain/exceptions/InvalidUuidException.js";

type UnsubscribeFromRequestDeleteParams = {
  id: string;
};

export default async function UnsubscribeFromRequestDeleteController(
  req: Request<UnsubscribeFromRequestDeleteParams>,
  res: Response
) {
  const commandHandler = new UnsubscribeFromRequestCommandHandler(new RequestDrizzleRepository(db));

  try {
    const command = new UnsubscribeFromRequestCommand(req.body.userId, req.params.id);

    await commandHandler.execute(command);
    return res.sendStatus(204);
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
