import { Request, Response } from "express";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import GiveToGetProgressDrizzleRepository from "../repositories/GiveToGetProgressDrizzleRepository.js";
import UnlockGiveToGetProgressCommand from "../../application/commands/UnlockGiveToGetProgressCommand.js";
import UnlockGiveToGetProgressCommandHandler from "../../application/handlers/UnlockGiveToGetProgressCommandHandler.js";
import GiveToGetProgressNotFoundException from "../../application/exceptions/GiveToGetProgressNotFoundException.js";
import InvalidUuidException from "../../../../shared/domain/exceptions/InvalidUuidException.js";
import UnauthorizedActionException from "../../../../shared/application/exceptions/UnauthorizedActionException.js";

type UnlockGiveToGetProgressPostParams = {
  id: string;
};

export default async function UnlockGiveToGetProgressPostController(
  req: Request<UnlockGiveToGetProgressPostParams>,
  res: Response
) {
  const commandHandler = new UnlockGiveToGetProgressCommandHandler(new GiveToGetProgressDrizzleRepository(db));

  try {
    if (!req.userId) {
      return res.status(401).send({ error: "UNAUTHORIZED", message: "User not authenticated" });
    }

    const command = new UnlockGiveToGetProgressCommand(req.params.id, req.userId);

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
