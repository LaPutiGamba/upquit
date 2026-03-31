import { Request, Response } from "express";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import BoardDrizzleRepository from "../repositories/BoardDrizzleRepository.js";
import CreateBoardCommand from "../../application/commands/CreateBoardCommand.js";
import CreateBoardCommandHandler from "../../application/handlers/CreateBoardCommandHandler.js";
import BoardAlreadyExistsException from "../../application/exceptions/BoardAlreadyExistsException.js";
import InvalidSlugException from "../../domain/exceptions/InvalidSlugException.js";
import InvalidHexColorException from "../../domain/exceptions/InvalidHexColorException.js";
import InvalidUuidException from "../../../../shared/domain/exceptions/InvalidUuidException.js";

export default async function CreateBoardPostController(req: Request, res: Response) {
  const commandHandler = new CreateBoardCommandHandler(new BoardDrizzleRepository(db));

  try {
    const command = new CreateBoardCommand(
      req.body.slug,
      req.body.name,
      req.body.ownerId,
      req.body.description ?? null,
      req.body.logoUrl ?? null,
      req.body.primaryColor ?? null,
      req.body.isPublic ?? null,
      req.body.allowAnonymousVotes ?? null,
      req.body.giveToGetEnabled ?? null,
      req.body.giveToGetVotesReq ?? null,
      req.body.giveToGetCommentsReq ?? null
    );

    const response = await commandHandler.execute(command);
    return res.status(201).json(response);
  } catch (ex) {
    if (ex instanceof BoardAlreadyExistsException) {
      return res.status(409).send({
        error: "BOARD_ALREADY_EXISTS",
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
    if (ex instanceof InvalidUuidException) {
      return res.status(400).send({
        error: "INVALID_OWNER_ID",
        message: ex.message
      });
    }

    console.error(ex);
    return res.sendStatus(500);
  }
}
