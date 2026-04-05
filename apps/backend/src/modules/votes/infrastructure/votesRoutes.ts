import { Router } from "express";
import { createVoteCommandHandler, deleteVoteCommandHandler } from "../../../shared/infrastructure/dependencies.js";
import CreateVotePostController from "./controllers/CreateVotePostController.js";
import GetVoteByRequestAndUserGetController from "./controllers/GetVoteByRequestAndUserGetController.js";
import GetVoteCountByRequestIdGetController from "./controllers/GetVoteCountByRequestIdGetController.js";
import GetVoteByIdGetController from "./controllers/GetVoteByIdGetController.js";
import DeleteVoteDeleteController from "./controllers/DeleteVoteDeleteController.js";

const votesRouter = Router();

votesRouter.post("/", (req, res) => CreateVotePostController(req, res, createVoteCommandHandler));
votesRouter.get("/", GetVoteByRequestAndUserGetController);
votesRouter.get("/count", GetVoteCountByRequestIdGetController);
votesRouter.get("/:id", GetVoteByIdGetController);
votesRouter.delete("/:id", (req, res) => DeleteVoteDeleteController(req, res, deleteVoteCommandHandler));

export default votesRouter;
