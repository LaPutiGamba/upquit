import { Request, Response } from "express";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import BoardDrizzleRepository from "../repositories/BoardDrizzleRepository.js";
import UpdateBoardMemberRoleCommand from "../../application/commands/UpdateBoardMemberRoleCommand.js";
import UpdateBoardMemberRoleCommandHandler from "../../application/handlers/UpdateBoardMemberRoleCommandHandler.js";
import BoardNotFoundException from "../../application/exceptions/BoardNotFoundException.js";
import BoardMemberNotFoundException from "../../application/exceptions/BoardMemberNotFoundException.js";
import InvalidUuidException from "../../../../shared/domain/exceptions/InvalidUuidException.js";
import UnauthorizedActionException from "../../../../shared/application/exceptions/UnauthorizedActionException.js";

type UpdateBoardMemberRolePatchParams = {
  boardId: string;
  userId: string;
};

const VALID_ROLES = new Set(["admin", "member"]);

export default async function UpdateBoardMemberRolePatchController(
  req: Request<UpdateBoardMemberRolePatchParams>,
  res: Response
) {
  const commandHandler = new UpdateBoardMemberRoleCommandHandler(new BoardDrizzleRepository(db));

  try {
    if (!req.userId) {
      return res.status(401).send({ error: "UNAUTHORIZED", message: "User not authenticated" });
    }

    const role = req.body.role;
    if (typeof role !== "string" || !VALID_ROLES.has(role)) {
      return res.status(400).send({ error: "INVALID_ROLE", message: "Invalid board member role" });
    }

    const command = new UpdateBoardMemberRoleCommand(req.params.boardId, req.params.userId, role, req.userId);

    await commandHandler.execute(command);
    return res.sendStatus(204);
  } catch (ex) {
    if (ex instanceof BoardNotFoundException) {
      return res.status(404).send({
        error: "BOARD_NOT_FOUND",
        message: ex.message
      });
    }
    if (ex instanceof BoardMemberNotFoundException) {
      return res.status(404).send({
        error: "BOARD_MEMBER_NOT_FOUND",
        message: ex.message
      });
    }
    if (ex instanceof InvalidUuidException) {
      return res.status(400).send({
        error: "INVALID_UUID",
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
