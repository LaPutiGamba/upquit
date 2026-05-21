import { Request, Response } from "express";
import type { SignOptions } from "jsonwebtoken";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import UserDrizzleRepository from "../repositories/UserDrizzleRepository.js";
import PasswordResetTokenSigner from "../services/PasswordResetTokenSigner.js";
import RequestPasswordResetQuery from "../../application/queries/RequestPasswordResetQuery.js";
import RequestPasswordResetQueryHandler from "../../application/handlers/RequestPasswordResetQueryHandler.js";
import ResendEmailSender from "../../../../shared/infrastructure/services/ResendEmailSender.js";
import ConsoleEmailSender from "../../../../shared/infrastructure/services/ConsoleEmailSender.js";
import InvalidEmailException from "../../domain/exceptions/InvalidEmailException.js";

type RequestPasswordResetBody = {
  email?: string;
};

export default async function RequestPasswordResetPostController(
  req: Request<RequestPasswordResetBody>,
  res: Response
) {
  const jwtResetSecret = process.env.JWT_RESET_SECRET || process.env.JWT_ACCESS_SECRET;
  const resendApiKey = process.env.RESEND_API_KEY || "";

  if (!jwtResetSecret) {
    console.error("JWT_RESET_SECRET or JWT_ACCESS_SECRET environment variable is required");
    return res.status(500).send({
      error: "JWT_RESET_SECRET_NOT_CONFIGURED",
      message: "JWT_RESET_SECRET or JWT_ACCESS_SECRET environment variable is required"
    });
  }

  const emailSender = resendApiKey ? new ResendEmailSender(resendApiKey) : new ConsoleEmailSender();

  const queryHandler = new RequestPasswordResetQueryHandler(
    new UserDrizzleRepository(db),
    emailSender,
    new PasswordResetTokenSigner(
      jwtResetSecret,
      (process.env.JWT_RESET_EXPIRES_IN as SignOptions["expiresIn"]) || "15m"
    )
  );

  try {
    if (typeof req.body.email !== "string") {
      throw new InvalidEmailException(String(req.body.email));
    }

    const locale = typeof req.query.locale === "string" ? req.query.locale : "en";
    const query = new RequestPasswordResetQuery(req.body.email, locale);
    const result = await queryHandler.execute(query);

    return res.status(200).json(result);
  } catch (ex) {
    if (ex instanceof InvalidEmailException) {
      return res.status(400).send({
        error: "INVALID_EMAIL",
        message: ex.message
      });
    }

    console.error(ex);
    return res.sendStatus(500);
  }
}
