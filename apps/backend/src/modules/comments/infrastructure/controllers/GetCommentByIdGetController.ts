import { Request, Response } from "express";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import CommentDrizzleRepository from "../repositories/CommentDrizzleRepository.js";
import GetCommentByIdQuery from "../../application/queries/GetCommentByIdQuery.js";
import GetCommentByIdQueryHandler from "../../application/handlers/GetCommentByIdQueryHandler.js";
import CommentNotFoundException from "../../application/exceptions/CommentNotFoundException.js";
import InvalidUuidException from "../../../../shared/domain/exceptions/InvalidUuidException.js";

type GetCommentByIdGetParams = {
  id: string;
};

export default async function GetCommentByIdGetController(req: Request<GetCommentByIdGetParams>, res: Response) {
  const queryHandler = new GetCommentByIdQueryHandler(new CommentDrizzleRepository(db));

  try {
    const command = new GetCommentByIdQuery(req.params.id);

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
        error: "INVALID_COMMENT_ID",
        message: ex.message
      });
    }

    console.error(ex);
    return res.sendStatus(500);
  }
}
