import { Router } from "express";
import { createUserCommandHandler } from "../../../shared/infrastructure/dependencies.js";
import CreateUserPostController from "./controllers/CreateUserPostController.js";
import GetUserByIdGetController from "./controllers/GetUserByIdGetController.js";
import GetUserByEmailGetController from "./controllers/GetUserByEmailGetController.js";
import UpdateUserPatchController from "./controllers/UpdateUserPatchController.js";
import DeactivateUserPostController from "./controllers/DeactivateUserPostController.js";
import VerifyUserEmailPostController from "./controllers/VerifyUserEmailPostController.js";
import AuthenticateUserPostController from "./controllers/AuthenticateUserPostController.js";
import { JwtAuthMiddleware } from "../../../shared/infrastructure/middlewares/JwtAuthMiddleware.js";
import { TenantDbMiddleware } from "../../../shared/infrastructure/middlewares/TenantDbMiddleware.js";

const usersRouter = Router();

// Public
usersRouter.post("/register", (req, res) => CreateUserPostController(req, res, createUserCommandHandler));
usersRouter.post("/login", AuthenticateUserPostController);
usersRouter.post("/:id/verify-email", VerifyUserEmailPostController);

// Protected
usersRouter.get("/", JwtAuthMiddleware, TenantDbMiddleware, GetUserByEmailGetController);
usersRouter.get("/:id", JwtAuthMiddleware, TenantDbMiddleware, GetUserByIdGetController);
usersRouter.patch("/:id", JwtAuthMiddleware, TenantDbMiddleware, UpdateUserPatchController);
usersRouter.post("/:id/deactivate", JwtAuthMiddleware, TenantDbMiddleware, DeactivateUserPostController);

export default usersRouter;
