import { Request, Response } from "express";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import BoardDrizzleRepository from "../repositories/BoardDrizzleRepository.js";
import GetBoardBySlugQuery from "../../application/queries/GetBoardBySlugQuery.js";
import GetBoardBySlugQueryHandler from "../../application/handlers/GetBoardBySlugQueryHandler.js";
import BoardNotFoundException from "../../application/exceptions/BoardNotFoundException.js";
import InvalidSlugException from "../../domain/exceptions/InvalidSlugException.js";

export default async function GetBoardBySlugGetController(req: Request, res: Response) {
  const queryHandler = new GetBoardBySlugQueryHandler(new BoardDrizzleRepository(db));

  try {
    if (!req.userId) {
      return res.status(401).send({ error: "UNAUTHORIZED", message: "User not authenticated" });
    }

    const slug = req.params.slug;
    if (typeof slug !== "string") {
      throw new InvalidSlugException(String(slug));
    }
    const command = new GetBoardBySlugQuery(slug);

    const response = await queryHandler.execute(command);

    if (response.ownerId !== req.userId) {
      return res.status(404).send({
        error: "BOARD_NOT_FOUND",
        message: `Board with slug ${slug} not found`
      });
    }

    return res.status(200).json(response);
  } catch (ex) {
    if (ex instanceof BoardNotFoundException) {
      return res.status(404).send({
        error: "BOARD_NOT_FOUND",
        message: ex.message
      });
    }
    if (ex instanceof InvalidSlugException) {
      return res.status(400).send({
        error: "INVALID_SLUG",
        message: ex.message
      });
    }

    console.error(ex);
    return res.sendStatus(500);
  }
}
