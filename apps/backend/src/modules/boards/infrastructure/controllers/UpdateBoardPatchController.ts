import { Request, Response } from "express";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import BoardDrizzleRepository from "../repositories/BoardDrizzleRepository.js";
import UpdateBoardCommand from "../../application/commands/UpdateBoardCommand.js";
import UpdateBoardCommandHandler from "../../application/handlers/UpdateBoardCommandHandler.js";
import BoardNotFoundException from "../../application/exceptions/BoardNotFoundException.js";
import InvalidUuidException from "../../../../shared/domain/exceptions/InvalidUuidException.js";
import InvalidSlugException from "../../domain/exceptions/InvalidSlugException.js";
import InvalidHexColorException from "../../domain/exceptions/InvalidHexColorException.js";

type UpdateBoardPatchParams = {
  id: string;
};

export default async function UpdateBoardPatchController(req: Request<UpdateBoardPatchParams>, res: Response) {
  const commandHandler = new UpdateBoardCommandHandler(new BoardDrizzleRepository(db));

  try {
    const command = new UpdateBoardCommand(
      req.params.id,
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

    console.error(ex);
    return res.sendStatus(500);
  }
}
