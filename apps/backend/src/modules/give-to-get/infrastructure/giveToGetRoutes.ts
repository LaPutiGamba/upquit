import { Router } from "express";
import CreateGiveToGetProgressPostController from "./controllers/CreateGiveToGetProgressPostController.js";
import GetGiveToGetProgressByIdGetController from "./controllers/GetGiveToGetProgressByIdGetController.js";
import GetGiveToGetProgressByUserAndBoardGetController from "./controllers/GetGiveToGetProgressByUserAndBoardGetController.js";
import UpdateGiveToGetProgressPatchController from "./controllers/UpdateGiveToGetProgressPatchController.js";
import UnlockGiveToGetProgressPostController from "./controllers/UnlockGiveToGetProgressPostController.js";

const giveToGetRouter = Router();

giveToGetRouter.post("/", CreateGiveToGetProgressPostController);
giveToGetRouter.get("/", GetGiveToGetProgressByUserAndBoardGetController);
giveToGetRouter.get("/:id", GetGiveToGetProgressByIdGetController);
giveToGetRouter.patch("/:id", UpdateGiveToGetProgressPatchController);
giveToGetRouter.post("/:id/unlock", UnlockGiveToGetProgressPostController);

export default giveToGetRouter;
