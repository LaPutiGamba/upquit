import { Router } from "express";
import { JwtAuthMiddleware } from "../../../shared/infrastructure/middlewares/JwtAuthMiddleware.js";
import { TenantDbMiddleware } from "../../../shared/infrastructure/middlewares/TenantDbMiddleware.js";
import CreateRequestPostController from "./controllers/CreateRequestPostController.js";
import GetRequestsByBoardIdGetController from "./controllers/GetRequestsByBoardIdGetController.js";
import GetRequestByIdGetController from "./controllers/GetRequestByIdGetController.js";
import GetRequestChangelogGetController from "./controllers/GetRequestChangelogGetController.js";
import UpdateRequestPatchController from "./controllers/UpdateRequestPatchController.js";
import SubscribeToRequestPostController from "./controllers/SubscribeToRequestPostController.js";
import UnsubscribeFromRequestDeleteController from "./controllers/UnsubscribeFromRequestDeleteController.js";
import IsSubscribedToRequestGetController from "./controllers/IsSubscribedToRequestGetController.js";

const requestsRouter = Router();

// Public
requestsRouter.get("/", GetRequestsByBoardIdGetController);
requestsRouter.get("/:id", GetRequestByIdGetController);
requestsRouter.get("/:id/changelog", GetRequestChangelogGetController);

// Protected
requestsRouter.post("/", JwtAuthMiddleware, TenantDbMiddleware, CreateRequestPostController);
requestsRouter.patch("/:id", JwtAuthMiddleware, TenantDbMiddleware, UpdateRequestPatchController);
requestsRouter.post("/:id/subscriptions", JwtAuthMiddleware, TenantDbMiddleware, SubscribeToRequestPostController);
requestsRouter.delete(
  "/:id/subscriptions",
  JwtAuthMiddleware,
  TenantDbMiddleware,
  UnsubscribeFromRequestDeleteController
);
requestsRouter.get("/:id/subscriptions", JwtAuthMiddleware, TenantDbMiddleware, IsSubscribedToRequestGetController);

export default requestsRouter;
