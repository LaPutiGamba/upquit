import { Router } from "express";
import { JwtAuthMiddleware } from "../../../shared/infrastructure/middlewares/JwtAuthMiddleware.js";
import { TenantDbMiddleware } from "../../../shared/infrastructure/middlewares/TenantDbMiddleware.js";
import CreateGiveToGetProgressPostController from "./controllers/CreateGiveToGetProgressPostController.js";
import GetGiveToGetProgressByIdGetController from "./controllers/GetGiveToGetProgressByIdGetController.js";
import GetGiveToGetProgressByUserAndBoardGetController from "./controllers/GetGiveToGetProgressByUserAndBoardGetController.js";
import UpdateGiveToGetProgressPatchController from "./controllers/UpdateGiveToGetProgressPatchController.js";
import UnlockGiveToGetProgressPostController from "./controllers/UnlockGiveToGetProgressPostController.js";

const giveToGetRouter = Router();

// Public
giveToGetRouter.get("/:id", GetGiveToGetProgressByIdGetController);

// Protected
giveToGetRouter.post("/", JwtAuthMiddleware, TenantDbMiddleware, CreateGiveToGetProgressPostController);
giveToGetRouter.get("/", JwtAuthMiddleware, TenantDbMiddleware, GetGiveToGetProgressByUserAndBoardGetController);
giveToGetRouter.patch("/:id", JwtAuthMiddleware, TenantDbMiddleware, UpdateGiveToGetProgressPatchController);
giveToGetRouter.post("/:id/unlock", JwtAuthMiddleware, TenantDbMiddleware, UnlockGiveToGetProgressPostController);

export default giveToGetRouter;
