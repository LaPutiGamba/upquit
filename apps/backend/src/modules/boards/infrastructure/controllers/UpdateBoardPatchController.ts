import { Request, Response } from "express";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import BoardDrizzleRepository from "../repositories/BoardDrizzleRepository.js";
import UpdateBoardCommand from "../../application/commands/UpdateBoardCommand.js";
import UpdateBoardCommandHandler from "../../application/handlers/UpdateBoardCommandHandler.js";
import BoardNotFoundException from "../../application/exceptions/BoardNotFoundException.js";
import InvalidUuidException from "../../../../shared/domain/exceptions/InvalidUuidException.js";
import InvalidSlugException from "../../domain/exceptions/InvalidSlugException.js";
import InvalidHexColorException from "../../domain/exceptions/InvalidHexColorException.js";
import InvalidGiveToGetRequirementsException from "../../domain/exceptions/InvalidGiveToGetRequirementsException.js";
import WebSocketRealtimePublisher from "../../../../shared/infrastructure/services/WebSocketRealtimePublisher.js";

export default async function UpdateBoardPatchController(req: Request, res: Response) {
  const commandHandler = new UpdateBoardCommandHandler(
    new BoardDrizzleRepository(db),
    new WebSocketRealtimePublisher()
  );

  try {
    if (!req.userId) {
      return res.status(401).send({ error: "UNAUTHORIZED", message: "User not authenticated" });
    }

    const command = new UpdateBoardCommand(
      req.params.id as string,
      req.body.slug,
      req.body.name,
      req.body.description,
      req.body.logoUrl,
      req.body.primaryColor,
      req.body.ownerId,
      req.body.isPublic,
      req.body.allowAnonymousVotes,
      req.body.giveToGetEnabled,
      req.body.giveToGetVotesReq,
      req.body.giveToGetCommentsReq
    );

    const response = await commandHandler.execute(command);
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
    if (ex instanceof InvalidSlugException) {
      return res.status(400).send({
        error: "INVALID_SLUG",
        message: ex.message
      });
    }
    if (ex instanceof InvalidHexColorException) {
      return res.status(400).send({
        error: "INVALID_PRIMARY_COLOR",
        message: ex.message
      });
    }
    if (ex instanceof InvalidGiveToGetRequirementsException) {
      return res.status(400).send({
        error: "INVALID_GIVE_TO_GET_REQUIREMENTS",
        message: ex.message
      });
    }

    console.error(ex);
    return res.sendStatus(500);
  }
}
