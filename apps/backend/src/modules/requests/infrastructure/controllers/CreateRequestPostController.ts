import { Request, Response } from "express";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import RequestDrizzleRepository from "../repositories/RequestDrizzleRepository.js";
import UserDrizzleRepository from "../../../users/infrastructure/repositories/UserDrizzleRepository.js";
import CreateRequestCommand from "../../application/commands/CreateRequestCommand.js";
import CreateRequestCommandHandler from "../../application/handlers/CreateRequestCommandHandler.js";
import InvalidUuidException from "../../../../shared/domain/exceptions/InvalidUuidException.js";
import InvalidRequestStatusException from "../../domain/exceptions/InvalidRequestStatusException.js";
import WebSocketRealtimePublisher from "../../../../shared/infrastructure/services/WebSocketRealtimePublisher.js";
import { boardRepository, eventBus } from "../../../../shared/infrastructure/dependencies.js";
import BoardNotFoundException from "../../../boards/application/exceptions/BoardNotFoundException.js";
import UnauthorizedActionException from "../../../../shared/application/exceptions/UnauthorizedActionException.js";

export default async function CreateRequestPostController(req: Request, res: Response) {
  const commandHandler = new CreateRequestCommandHandler(
    new RequestDrizzleRepository(db),
    boardRepository,
    new UserDrizzleRepository(db),
    new WebSocketRealtimePublisher(),
    eventBus
  );

  try {
    if (!req.userId) {
      return res.status(401).send({ error: "UNAUTHORIZED", message: "User not authenticated" });
    }

    const command = new CreateRequestCommand(
      req.body.boardId,
      req.userId,
      req.body.title,
      req.body.description ?? null,
      Array.isArray(req.body.categoryIds) ? req.body.categoryIds : [],
      req.body.status ?? "open",
      req.body.voteCount ?? 0,
      req.body.isPinned ?? false,
      req.body.isHidden ?? false,
      req.body.adminNote ?? null
    );

    const response = await commandHandler.execute(command);
    return res.status(201).json(response);
  } catch (ex) {
    if (ex instanceof InvalidUuidException) {
      return res.status(400).send({
        error: "INVALID_REQUEST_REFERENCE_ID",
        message: ex.message
      });
    }
    if (ex instanceof InvalidRequestStatusException) {
      return res.status(400).send({
        error: "INVALID_REQUEST_STATUS",
        message: ex.message
      });
    }
    if (ex instanceof BoardNotFoundException) {
      return res.status(404).send({
        error: "BOARD_NOT_FOUND",
        message: ex.message
      });
    }
    if (ex instanceof UnauthorizedActionException) {
      return res.status(403).send({
        error: "FORBIDDEN",
        message: ex.message
      });
    }

    console.error(ex);
    return res.sendStatus(500);
  }
}
