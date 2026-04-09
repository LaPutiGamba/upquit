import { Request, Response } from "express";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import GiveToGetProgressDrizzleRepository from "../repositories/GiveToGetProgressDrizzleRepository.js";
import GetGiveToGetProgressByUserAndBoardQuery from "../../application/queries/GetGiveToGetProgressByUserAndBoardQuery.js";
import GetGiveToGetProgressByUserAndBoardQueryHandler from "../../application/handlers/GetGiveToGetProgressByUserAndBoardQueryHandler.js";
import GiveToGetProgressNotFoundException from "../../application/exceptions/GiveToGetProgressNotFoundException.js";
import InvalidUuidException from "../../../../shared/domain/exceptions/InvalidUuidException.js";

export default async function GetGiveToGetProgressByUserAndBoardGetController(req: Request, res: Response) {
  const queryHandler = new GetGiveToGetProgressByUserAndBoardQueryHandler(new GiveToGetProgressDrizzleRepository(db));

  try {
    if (!req.userId) {
      return res.status(401).send({ error: "UNAUTHORIZED", message: "User not authenticated" });
    }

    const boardId = req.query.boardId;
    if (typeof boardId !== "string") {
      throw new InvalidUuidException(String(boardId));
    }

    const command = new GetGiveToGetProgressByUserAndBoardQuery(req.userId, boardId);

    const response = await queryHandler.execute(command);
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
        error: "INVALID_GIVE_TO_GET_REFERENCE_ID",
        message: ex.message
      });
    }

    console.error(ex);
    return res.sendStatus(500);
  }
}
