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

const usersRouter = Router();

// Public
usersRouter.post("/register", (req, res) => CreateUserPostController(req, res, createUserCommandHandler));
usersRouter.get("/username-available", GetUsernameAvailabilityGetController);
usersRouter.get("/username/:username", GetUserByUsernameGetController);
usersRouter.post("/login", AuthenticateUserPostController);
usersRouter.post("/refresh", RefreshAccessTokenPostController);
usersRouter.post("/logout", LogoutUserPostController);
usersRouter.post("/:id/verify-email", VerifyUserEmailPostController);

// Protected
usersRouter.get("/", JwtAuthMiddleware, TenantDbMiddleware, GetUserByEmailGetController);
usersRouter.get("/:id", JwtAuthMiddleware, TenantDbMiddleware, GetUserByIdGetController);
usersRouter.patch("/:id", JwtAuthMiddleware, TenantDbMiddleware, UpdateUserPatchController);
usersRouter.post("/:id/deactivate", JwtAuthMiddleware, TenantDbMiddleware, DeactivateUserPostController);

export default usersRouter;
