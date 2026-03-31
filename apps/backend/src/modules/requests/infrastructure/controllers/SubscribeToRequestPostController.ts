import { Request, Response } from "express";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import RequestDrizzleRepository from "../repositories/RequestDrizzleRepository.js";
import SubscribeToRequestCommand from "../../application/commands/SubscribeToRequestCommand.js";
import SubscribeToRequestCommandHandler from "../../application/handlers/SubscribeToRequestCommandHandler.js";
import RequestNotFoundException from "../../application/exceptions/RequestNotFoundException.js";
import RequestAlreadySubscribedException from "../../application/exceptions/RequestAlreadySubscribedException.js";
import InvalidUuidException from "../../../../shared/domain/exceptions/InvalidUuidException.js";

type SubscribeToRequestPostParams = {
  id: string;
};

export default async function SubscribeToRequestPostController(
  req: Request<SubscribeToRequestPostParams>,
  res: Response
) {
  const commandHandler = new SubscribeToRequestCommandHandler(new RequestDrizzleRepository(db));

  try {
    const command = new SubscribeToRequestCommand(req.body.userId, req.params.id);

    const response = await commandHandler.execute(command);
    return res.status(201).json(response);
  } catch (ex) {
    if (ex instanceof RequestNotFoundException) {
      return res.status(404).send({
        error: "REQUEST_NOT_FOUND",
        message: ex.message
      });
    }
    if (ex instanceof RequestAlreadySubscribedException) {
      return res.status(409).send({
        error: "REQUEST_ALREADY_SUBSCRIBED",
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
