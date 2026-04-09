import { Router } from "express";
import { JwtAuthMiddleware } from "../../../shared/infrastructure/middlewares/JwtAuthMiddleware.js";
import CreateGiveToGetProgressPostController from "./controllers/CreateGiveToGetProgressPostController.js";
import GetGiveToGetProgressByIdGetController from "./controllers/GetGiveToGetProgressByIdGetController.js";
import GetGiveToGetProgressByUserAndBoardGetController from "./controllers/GetGiveToGetProgressByUserAndBoardGetController.js";
import UpdateGiveToGetProgressPatchController from "./controllers/UpdateGiveToGetProgressPatchController.js";
import UnlockGiveToGetProgressPostController from "./controllers/UnlockGiveToGetProgressPostController.js";

const giveToGetRouter = Router();

// Public
giveToGetRouter.get("/:id", GetGiveToGetProgressByIdGetController);

// Protected
giveToGetRouter.post("/", JwtAuthMiddleware, CreateGiveToGetProgressPostController);
giveToGetRouter.get("/", JwtAuthMiddleware, GetGiveToGetProgressByUserAndBoardGetController);
giveToGetRouter.patch("/:id", JwtAuthMiddleware, UpdateGiveToGetProgressPatchController);
giveToGetRouter.post("/:id/unlock", JwtAuthMiddleware, UnlockGiveToGetProgressPostController);

export default giveToGetRouter;
