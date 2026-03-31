import { Router } from "express";
import CreateVotePostController from "./controllers/CreateVotePostController.js";
import GetVoteByRequestAndUserGetController from "./controllers/GetVoteByRequestAndUserGetController.js";
import GetVoteCountByRequestIdGetController from "./controllers/GetVoteCountByRequestIdGetController.js";
import GetVoteByIdGetController from "./controllers/GetVoteByIdGetController.js";
import DeleteVoteDeleteController from "./controllers/DeleteVoteDeleteController.js";

const votesRouter = Router();

votesRouter.post("/", CreateVotePostController);
votesRouter.get("/", GetVoteByRequestAndUserGetController);
votesRouter.get("/count", GetVoteCountByRequestIdGetController);
votesRouter.get("/:id", GetVoteByIdGetController);
votesRouter.delete("/:id", DeleteVoteDeleteController);

export default votesRouter;
