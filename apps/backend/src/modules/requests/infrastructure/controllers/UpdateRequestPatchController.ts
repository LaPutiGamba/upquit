import { Request, Response } from "express";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import RequestDrizzleRepository from "../repositories/RequestDrizzleRepository.js";
import UpdateRequestCommand from "../../application/commands/UpdateRequestCommand.js";
import UpdateRequestCommandHandler from "../../application/handlers/UpdateRequestCommandHandler.js";
import RequestNotFoundException from "../../application/exceptions/RequestNotFoundException.js";
import InvalidUuidException from "../../../../shared/domain/exceptions/InvalidUuidException.js";
import InvalidRequestStatusException from "../../domain/exceptions/InvalidRequestStatusException.js";
import WebSocketRealtimePublisher from "../../../../shared/infrastructure/services/WebSocketRealtimePublisher.js";
import { getWebSocketServer } from "../../../../shared/infrastructure/websocket/WebSocketServerRegistry.js";

type UpdateRequestPatchParams = {
  id: string;
};

export default async function UpdateRequestPatchController(req: Request<UpdateRequestPatchParams>, res: Response) {
  const commandHandler = new UpdateRequestCommandHandler(
    new RequestDrizzleRepository(db),
    new WebSocketRealtimePublisher(getWebSocketServer())
  );

  try {
    const command = new UpdateRequestCommand(
      req.params.id,
      req.body.title,
      req.body.description,
      req.body.categoryId,
      req.body.status,
      req.body.voteCount,
      req.body.isPinned,
      req.body.isHidden,
      req.body.adminNote
    );

    const response = await commandHandler.execute(command);
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
    if (ex instanceof InvalidRequestStatusException) {
      return res.status(400).send({
        error: "INVALID_REQUEST_STATUS",
        message: ex.message
      });
    }

    console.error(ex);
    return res.sendStatus(500);
  }
}
