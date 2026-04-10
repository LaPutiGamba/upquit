import { Router } from "express";
import { createVoteCommandHandler, deleteVoteCommandHandler } from "../../../shared/infrastructure/dependencies.js";
import CreateVotePostController from "./controllers/CreateVotePostController.js";
import GetVoteByRequestAndUserGetController from "./controllers/GetVoteByRequestAndUserGetController.js";
import GetVoteCountByRequestIdGetController from "./controllers/GetVoteCountByRequestIdGetController.js";
import GetVoteByIdGetController from "./controllers/GetVoteByIdGetController.js";
import DeleteVoteDeleteController from "./controllers/DeleteVoteDeleteController.js";
import { JwtAuthMiddleware } from "../../../shared/infrastructure/middlewares/JwtAuthMiddleware.js";
import { TenantDbMiddleware } from "../../../shared/infrastructure/middlewares/TenantDbMiddleware.js";

const votesRouter = Router();

// Public
votesRouter.get("/", GetVoteByRequestAndUserGetController);
votesRouter.get("/count", GetVoteCountByRequestIdGetController);
votesRouter.get("/:id", GetVoteByIdGetController);

// Protected
votesRouter.post("/", JwtAuthMiddleware, TenantDbMiddleware, (req, res) =>
  CreateVotePostController(req, res, createVoteCommandHandler)
);
votesRouter.delete("/:id", JwtAuthMiddleware, TenantDbMiddleware, (req, res) =>
  DeleteVoteDeleteController(req, res, deleteVoteCommandHandler)
);

export default votesRouter;
