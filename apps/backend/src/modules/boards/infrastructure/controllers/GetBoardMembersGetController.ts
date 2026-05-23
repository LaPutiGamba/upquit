import { Request, Response } from "express";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import BoardDrizzleRepository from "../repositories/BoardDrizzleRepository.js";
import GetBoardMembersByBoardIdQuery, { BoardMemberRole } from "../../application/queries/GetBoardMembersByBoardIdQuery.js";
import GetBoardMembersByBoardIdQueryHandler from "../../application/handlers/GetBoardMembersByBoardIdQueryHandler.js";
import BoardNotFoundException from "../../application/exceptions/BoardNotFoundException.js";
import InvalidUuidException from "../../../../shared/domain/exceptions/InvalidUuidException.js";

type GetBoardMembersGetParams = {
  id: string;
};

const ALLOWED_ROLES: BoardMemberRole[] = ["admin", "member"];

export default async function GetBoardMembersGetController(req: Request<GetBoardMembersGetParams>, res: Response) {
  const queryHandler = new GetBoardMembersByBoardIdQueryHandler(new BoardDrizzleRepository(db));

  try {
    const roleQuery = req.query.role;
    const role = roleQuery && ALLOWED_ROLES.includes(roleQuery as BoardMemberRole) ? roleQuery as BoardMemberRole : undefined;

    const search = typeof req.query.search === "string" ? req.query.search : undefined;

    const requestedLimit = typeof req.query.limit === "string" ? Number(req.query.limit) : 50;
    const requestedOffset = typeof req.query.offset === "string" ? Number(req.query.offset) : 0;

    const limit = Number.isFinite(requestedLimit) ? Math.min(200, Math.max(1, Math.trunc(requestedLimit))) : 50;
    const offset = Number.isFinite(requestedOffset) ? Math.max(0, Math.trunc(requestedOffset)) : 0;

    const command = new GetBoardMembersByBoardIdQuery({
      boardId: req.params.id,
      role,
      search,
      limit,
      offset
    });

    const response = await queryHandler.execute(command);
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

    console.error(ex);
    return res.sendStatus(500);
  }
}
