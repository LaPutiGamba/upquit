import { Request, Response } from "express";
import type { SignOptions } from "jsonwebtoken";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import UserDrizzleRepository from "../repositories/UserDrizzleRepository.js";
import BcryptPasswordHasher from "../services/BcryptPasswordHasher.js";
import PasswordResetTokenSigner from "../services/PasswordResetTokenSigner.js";
import ResetPasswordQuery from "../../application/queries/ResetPasswordQuery.js";
import ResetPasswordQueryHandler from "../../application/handlers/ResetPasswordQueryHandler.js";
import InvalidResetTokenException from "../../application/exceptions/InvalidResetTokenException.js";

type ResetPasswordBody = {
  token?: string;
  newPassword?: string;
};

export default async function ResetPasswordPostController(req: Request<ResetPasswordBody>, res: Response) {
  const jwtResetSecret = process.env.JWT_RESET_SECRET || process.env.JWT_ACCESS_SECRET;

  if (!jwtResetSecret) {
    console.error("JWT_RESET_SECRET or JWT_ACCESS_SECRET environment variable is required");
    return res.status(500).send({
      error: "JWT_RESET_SECRET_NOT_CONFIGURED",
      message: "JWT_RESET_SECRET or JWT_ACCESS_SECRET environment variable is required"
    });
  }

  const queryHandler = new ResetPasswordQueryHandler(
    new UserDrizzleRepository(db),
    new BcryptPasswordHasher(),
    new PasswordResetTokenSigner(
      jwtResetSecret,
      (process.env.JWT_RESET_EXPIRES_IN as SignOptions["expiresIn"]) || "15m"
    )
  );

  try {
    if (typeof req.body.token !== "string") {
      throw new InvalidResetTokenException("Invalid reset token");
    }

    if (typeof req.body.newPassword !== "string") {
      throw new InvalidResetTokenException("Invalid password");
    }

    const query = new ResetPasswordQuery(req.body.token, req.body.newPassword);
    const result = await queryHandler.execute(query);

    return res.status(200).json(result);
  } catch (ex) {
    if (ex instanceof InvalidResetTokenException) {
      return res.status(401).send({
        error: "INVALID_RESET_TOKEN",
        message: ex.message
      });
    }

    console.error(ex);
    return res.sendStatus(500);
  }
}
