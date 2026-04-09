import { Request, Response } from "express";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import GiveToGetProgressDrizzleRepository from "../repositories/GiveToGetProgressDrizzleRepository.js";
import CreateGiveToGetProgressCommand from "../../application/commands/CreateGiveToGetProgressCommand.js";
import CreateGiveToGetProgressCommandHandler from "../../application/handlers/CreateGiveToGetProgressCommandHandler.js";
import GiveToGetProgressAlreadyExistsException from "../../application/exceptions/GiveToGetProgressAlreadyExistsException.js";
import InvalidUuidException from "../../../../shared/domain/exceptions/InvalidUuidException.js";

export default async function CreateGiveToGetProgressPostController(req: Request, res: Response) {
  const commandHandler = new CreateGiveToGetProgressCommandHandler(new GiveToGetProgressDrizzleRepository(db));

  try {
    if (!req.userId) {
      return res.status(401).send({ error: "UNAUTHORIZED", message: "User not authenticated" });
    }

    const command = new CreateGiveToGetProgressCommand(
      req.userId,
      req.body.boardId,
      req.body.votesGiven ?? 0,
      req.body.qualifyingComments ?? 0,
      req.body.canPost ?? false,
      req.body.unlockedAt ?? null
    );

    const response = await commandHandler.execute(command);
    return res.status(201).json(response);
  } catch (ex) {
    if (ex instanceof GiveToGetProgressAlreadyExistsException) {
      return res.status(409).send({
        error: "GIVE_TO_GET_PROGRESS_ALREADY_EXISTS",
        message: ex.message
      });
    }
    if (ex instanceof InvalidUuidException) {
      return res.status(400).send({
        error: "INVALID_GIVE_TO_GET_REFERENCE_ID",
        message: ex.message
      });
    }

    console.error(ex);
    return res.sendStatus(500);
  }
}
