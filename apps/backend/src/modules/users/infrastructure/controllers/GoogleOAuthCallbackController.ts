import { Request, Response } from "express";
import type { SignOptions } from "jsonwebtoken";
import { db } from "../../../../shared/infrastructure/database/connection.js";
import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import UserDrizzleRepository from "../repositories/UserDrizzleRepository.js";
import JwtTokenSigner from "../services/JwtTokenSigner.js";
import CreateUserCommand from "../../application/commands/CreateUserCommand.js";
import { createUserCommandHandler } from "../../../../shared/infrastructure/dependencies.js";
import AuthenticateByOAuthQuery from "../../application/queries/AuthenticateByOAuthQuery.js";
import AuthenticateByOAuthQueryHandler from "../../application/handlers/AuthenticateByOAuthQueryHandler.js";
import BoardDrizzleRepository from "../../../boards/infrastructure/repositories/BoardDrizzleRepository.js";
import OAuthUserNotFoundApplicationException from "../../application/exceptions/OAuthUserNotFoundApplicationException.js";

type GoogleOAuthCallbackQuery = {
  code?: string;
  state?: string;
  error?: string;
};

export default async function GoogleOAuthCallbackController(req: Request<GoogleOAuthCallbackQuery>, res: Response) {
  const jwtAccessSecret = process.env.JWT_ACCESS_SECRET;
  if (!jwtAccessSecret) {
    console.error("JWT_ACCESS_SECRET environment variable is required");
    return res.status(500).send({
      error: "JWT_ACCESS_SECRET_NOT_CONFIGURED",
      message: "JWT_ACCESS_SECRET environment variable is required"
    });
  }

  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || jwtAccessSecret;
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const frontendDefaultLocale = process.env.FRONTEND_DEFAULT_LOCALE || "en";

  try {
    // Check for OAuth errors
    const allowedLocales = ["en", "es", "ca"];
    const stateLocale = typeof req.query.state === "string" ? req.query.state : undefined;
    const acceptLanguage =
      typeof req.headers["accept-language"] === "string" ? req.headers["accept-language"] : undefined;
    let detectedLocale: string | undefined = undefined;

    if (stateLocale && allowedLocales.includes(stateLocale)) {
      detectedLocale = stateLocale;
    } else if (acceptLanguage) {
      const primary = acceptLanguage.split(",")[0].split("-")[0];
      if (allowedLocales.includes(primary)) detectedLocale = primary;
    }

    const localeToUse = detectedLocale || frontendDefaultLocale;

    if (req.query.error) {
      return res.redirect(
        `${frontendUrl}/${localeToUse}/auth/login?error=${encodeURIComponent(req.query.error as string)}`
      );
    }

    // Validate that we have an authorization code
    if (!req.query.code || typeof req.query.code !== "string") {
      return res.redirect(`${frontendUrl}/${frontendDefaultLocale}/auth/login?error=missing_code`);
    }

    const user = req.user as
      | {
          googleId: string;
          email: string;
          displayName: string;
          avatarUrl?: string;
        }
      | undefined;

    if (!user || !user.googleId) {
      return res.redirect(`${frontendUrl}/${frontendDefaultLocale}/auth/login?error=authentication_failed`);
    }

    const userRepository = new UserDrizzleRepository(db);
    const boardRepository = new BoardDrizzleRepository(db);
    const tokenSigner = new JwtTokenSigner(
      jwtAccessSecret,
      jwtRefreshSecret,
      (process.env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"]) ?? "15m",
      (process.env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"]) ?? "7d"
    );

    try {
      // Login existing user
      const authenticateHandler = new AuthenticateByOAuthQueryHandler(userRepository, boardRepository, tokenSigner);
      const query = new AuthenticateByOAuthQuery("google", user.googleId);
      const { accessToken, refreshToken } = await authenticateHandler.execute(query);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        partitioned: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return res.redirect(`${frontendUrl}/${localeToUse}/auth/google/success?token=${accessToken}`);
    } catch (error) {
      // Create a new one
      if (error instanceof OAuthUserNotFoundApplicationException) {
        let baseUsername = user.displayName.toLowerCase().replace(/\s+/g, "-").slice(0, 20);
        let username = baseUsername;
        let counter = 1;

        while (await userRepository.findByUsername(username)) {
          username = `${baseUsername}-${counter}`;
          counter++;
        }

        const createCommand = new CreateUserCommand(
          username,
          user.email,
          user.displayName,
          null,
          "google",
          user.googleId,
          user.avatarUrl || null
        );

        const createdUser = await createUserCommandHandler.execute(createCommand);

        const boardIds = await boardRepository.findBoardIdsByUserId(new Uuid(createdUser.id));
        const payload = {
          sub: createdUser.id,
          userId: createdUser.id,
          boardIds
        };
        const { accessToken, refreshToken } = await tokenSigner.signTokenPair(payload as any);

        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          partitioned: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.redirect(`${frontendUrl}/${localeToUse}/auth/google/success?token=${accessToken}`);
      }

      throw error;
    }
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return res.redirect(`${frontendUrl}/[locale]/auth/login?error=oauth_error`);
  }
}
