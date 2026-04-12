import { Request, Response } from "express";
import type { SignOptions } from "jsonwebtoken";
import { db } from "../../../../shared/infrastructure/database/connection.js";

import BoardDrizzleRepository from "../../../boards/infrastructure/repositories/BoardDrizzleRepository.js";
import JwtTokenSigner from "../services/JwtTokenSigner.js";
import RefreshAccessTokenQuery from "../../application/queries/RefreshAccessTokenQuery.js";
import RefreshAccessTokenQueryHandler from "../../application/handlers/RefreshAccessTokenQueryHandler.js";
import InvalidRefreshTokenException from "../../application/exceptions/InvalidRefreshTokenException.js";

export default async function RefreshAccessTokenPostController(req: Request, res: Response) {
  const jwtAccessSecret = process.env.JWT_ACCESS_SECRET;
  if (!jwtAccessSecret) {
    return res.status(500).send({
      error: "JWT_ACCESS_SECRET_NOT_CONFIGURED",
      message: "JWT_ACCESS_SECRET environment variable is required"
    });
  }

  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || jwtAccessSecret;

  const queryHandler = new RefreshAccessTokenQueryHandler(
    new BoardDrizzleRepository(db),
    new JwtTokenSigner(
      jwtAccessSecret,
      jwtRefreshSecret,
      (process.env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"]) ?? "15m",
      (process.env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"]) ?? "7d"
    )
  );

  try {
    const refreshToken = req.cookies?.refreshToken;

    if (typeof refreshToken !== "string" || refreshToken.length === 0) {
      throw new InvalidRefreshTokenException();
    }

    const query = new RefreshAccessTokenQuery(refreshToken);
    const { accessToken, refreshToken: rotatedRefreshToken } = await queryHandler.execute(query);

    res.cookie("refreshToken", rotatedRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({ accessToken });
  } catch (ex) {
    if (ex instanceof InvalidRefreshTokenException) {
      return res.status(401).send({
        error: "INVALID_REFRESH_TOKEN",
        message: ex.message
      });
    }

    console.error(ex);
    return res.sendStatus(500);
  }
}
