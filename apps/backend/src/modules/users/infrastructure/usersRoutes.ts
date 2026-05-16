import { Router } from "express";
import { createUserCommandHandler } from "../../../shared/infrastructure/dependencies.js";
import CreateUserPostController from "./controllers/CreateUserPostController.js";
import GetUsernameAvailabilityGetController from "./controllers/GetUsernameAvailabilityGetController.js";
import GetUserByUsernameGetController from "./controllers/GetUserByUsernameGetController.js";
import GetUserByIdGetController from "./controllers/GetUserByIdGetController.js";
import GetUserByEmailGetController from "./controllers/GetUserByEmailGetController.js";
import UpdateUserPatchController from "./controllers/UpdateUserPatchController.js";
import DeactivateUserPostController from "./controllers/DeactivateUserPostController.js";
import VerifyUserEmailPostController from "./controllers/VerifyUserEmailPostController.js";
import AuthenticateUserPostController from "./controllers/AuthenticateUserPostController.js";
import RefreshAccessTokenPostController from "./controllers/RefreshAccessTokenPostController.js";
import LogoutUserPostController from "./controllers/LogoutUserPostController.js";
import { JwtAuthMiddleware } from "../../../shared/infrastructure/middlewares/JwtAuthMiddleware.js";
import { TenantDbMiddleware } from "../../../shared/infrastructure/middlewares/TenantDbMiddleware.js";
import passport from "passport";
import GoogleOAuthCallbackController from "./controllers/GoogleOAuthCallbackController.js";

const usersRouter = Router();

// Public
usersRouter.post("/register", (req, res) => CreateUserPostController(req, res, createUserCommandHandler));
usersRouter.get("/username-available", GetUsernameAvailabilityGetController);
usersRouter.get("/username/:username", GetUserByUsernameGetController);
usersRouter.get("/:id", GetUserByIdGetController);
usersRouter.post("/login", AuthenticateUserPostController);
usersRouter.post("/refresh", RefreshAccessTokenPostController);
usersRouter.post("/logout", LogoutUserPostController);
usersRouter.post("/:id/verify-email", VerifyUserEmailPostController);

// Google OAuth
usersRouter.get("/auth/google", (req, res, next) => {
  const locale = typeof req.query.locale === "string" ? req.query.locale : undefined;
  const authOptions: any = { scope: ["profile", "email"], session: false };
  if (locale) authOptions.state = locale;
  authOptions.accessType = "offline";
  authOptions.prompt = "consent";

  return passport.authenticate("google", authOptions)(req, res, next);
});

usersRouter.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", session: false }),
  GoogleOAuthCallbackController
);

// Protected
usersRouter.get("/", JwtAuthMiddleware, TenantDbMiddleware, GetUserByEmailGetController);
usersRouter.patch("/:id", JwtAuthMiddleware, TenantDbMiddleware, UpdateUserPatchController);
usersRouter.post("/:id/deactivate", JwtAuthMiddleware, TenantDbMiddleware, DeactivateUserPostController);

export default usersRouter;
