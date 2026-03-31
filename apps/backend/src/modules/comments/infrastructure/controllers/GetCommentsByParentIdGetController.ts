import { Request, Response } from "express";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import CommentDrizzleRepository from "../repositories/CommentDrizzleRepository.js";
import GetCommentsByParentIdQuery from "../../application/queries/GetCommentsByParentIdQuery.js";
import GetCommentsByParentIdQueryHandler from "../../application/handlers/GetCommentsByParentIdQueryHandler.js";
import CommentNotFoundException from "../../application/exceptions/CommentNotFoundException.js";
import InvalidUuidException from "../../../../shared/domain/exceptions/InvalidUuidException.js";

export default async function GetCommentsByParentIdGetController(req: Request, res: Response) {
  const queryHandler = new GetCommentsByParentIdQueryHandler(new CommentDrizzleRepository(db));

  try {
    const parentId = req.query.parentId;
    if (typeof parentId !== "string") {
      throw new InvalidUuidException(String(parentId));
    }

    const command = new GetCommentsByParentIdQuery(parentId);

    const response = await queryHandler.execute(command);
    return res.status(200).json(response);
  } catch (ex) {
    if (ex instanceof CommentNotFoundException) {
      return res.status(404).send({
        error: "COMMENT_NOT_FOUND",
        message: ex.message
      });
    }
    if (ex instanceof InvalidUuidException) {
      return res.status(400).send({
        error: "INVALID_PARENT_ID",
        message: ex.message
      });
    }

    console.error(ex);
    return res.sendStatus(500);
  }
}
