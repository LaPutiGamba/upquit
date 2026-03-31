import { Request, Response } from "express";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import CommentDrizzleRepository from "../repositories/CommentDrizzleRepository.js";
import GetCommentsByRequestIdQuery from "../../application/queries/GetCommentsByRequestIdQuery.js";
import GetCommentsByRequestIdQueryHandler from "../../application/handlers/GetCommentsByRequestIdQueryHandler.js";
import InvalidUuidException from "../../../../shared/domain/exceptions/InvalidUuidException.js";

export default async function GetCommentsByRequestIdGetController(req: Request, res: Response) {
  const queryHandler = new GetCommentsByRequestIdQueryHandler(new CommentDrizzleRepository(db));

  try {
    const requestId = req.query.requestId;
    if (typeof requestId !== "string") {
      throw new InvalidUuidException(String(requestId));
    }

    const command = new GetCommentsByRequestIdQuery(requestId);

    const response = await queryHandler.execute(command);
    return res.status(200).json(response);
  } catch (ex) {
    if (ex instanceof InvalidUuidException) {
      return res.status(400).send({
        error: "INVALID_REQUEST_ID",
        message: ex.message
      });
    }

    console.error(ex);
    return res.sendStatus(500);
  }
}
