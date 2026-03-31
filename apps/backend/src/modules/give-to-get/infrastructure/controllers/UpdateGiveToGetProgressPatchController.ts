import { Request, Response } from "express";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import GiveToGetProgressDrizzleRepository from "../repositories/GiveToGetProgressDrizzleRepository.js";
import UpdateGiveToGetProgressCommand from "../../application/commands/UpdateGiveToGetProgressCommand.js";
import UpdateGiveToGetProgressCommandHandler from "../../application/handlers/UpdateGiveToGetProgressCommandHandler.js";
import GiveToGetProgressNotFoundException from "../../application/exceptions/GiveToGetProgressNotFoundException.js";
import InvalidUuidException from "../../../../shared/domain/exceptions/InvalidUuidException.js";

type UpdateGiveToGetProgressPatchParams = {
  id: string;
};

export default async function UpdateGiveToGetProgressPatchController(
  req: Request<UpdateGiveToGetProgressPatchParams>,
  res: Response
) {
  const commandHandler = new UpdateGiveToGetProgressCommandHandler(new GiveToGetProgressDrizzleRepository(db));

  try {
    const command = new UpdateGiveToGetProgressCommand(
      req.params.id,
      req.body.votesGiven,
      req.body.qualifyingComments,
      req.body.canPost,
      req.body.unlockedAt
    );

    const response = await commandHandler.execute(command);
    return res.status(200).json(response);
  } catch (ex) {
    if (ex instanceof GiveToGetProgressNotFoundException) {
      return res.status(404).send({
        error: "GIVE_TO_GET_PROGRESS_NOT_FOUND",
        message: ex.message
      });
    }
    if (ex instanceof InvalidUuidException) {
      return res.status(400).send({
        error: "INVALID_GIVE_TO_GET_PROGRESS_ID",
        message: ex.message
      });
    }

    console.error(ex);
    return res.sendStatus(500);
  }
}
