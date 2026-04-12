import { Request, Response } from "express";
import type { SignOptions } from "jsonwebtoken";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import UserDrizzleRepository from "../repositories/UserDrizzleRepository.js";
import BcryptPasswordHasher from "../services/BcryptPasswordHasher.js";
import JwtTokenSigner from "../services/JwtTokenSigner.js";
import AuthenticateUserQuery from "../../application/queries/AuthenticateUserQuery.js";
import AuthenticateUserQueryHandler from "../../application/handlers/AuthenticateUserQueryHandler.js";
import InvalidCredentialsException from "../../application/exceptions/InvalidCredentialsException.js";
import InvalidEmailException from "../../domain/exceptions/InvalidEmailException.js";
import BoardDrizzleRepository from "../../../boards/infrastructure/repositories/BoardDrizzleRepository.js";

type AuthenticateUserBody = {
  email?: string;
  password?: string;
};

export default async function AuthenticateUserPostController(req: Request<AuthenticateUserBody>, res: Response) {
  const jwtAccessSecret = process.env.JWT_ACCESS_SECRET;
  if (!jwtAccessSecret) {
    console.error("JWT_ACCESS_SECRET environment variable is required");
    return res.status(500).send({
      error: "JWT_ACCESS_SECRET_NOT_CONFIGURED",
      message: "JWT_ACCESS_SECRET environment variable is required"
    });
  }
  
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || jwtAccessSecret;

  const queryHandler = new AuthenticateUserQueryHandler(
    new UserDrizzleRepository(db),
    new BoardDrizzleRepository(db),
    new BcryptPasswordHasher(),
    new JwtTokenSigner(
      jwtAccessSecret,
      jwtRefreshSecret,
      (process.env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"]) ?? "15m",
      (process.env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"]) ?? "7d"
    )
  );

  try {
    if (typeof req.body.email !== "string") {
      throw new InvalidEmailException(String(req.body.email));
    }
    if (typeof req.body.password !== "string") {
      throw new InvalidCredentialsException();
    }

    const query = new AuthenticateUserQuery(req.body.email, req.body.password);
    const { accessToken, refreshToken } = await queryHandler.execute(query);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({ accessToken });
  } catch (ex) {
    if (ex instanceof InvalidCredentialsException) {
      return res.status(401).send({
        error: "INVALID_CREDENTIALS",
        message: ex.message
      });
    }
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
