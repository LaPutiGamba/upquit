import { Router } from "express";
import { JwtAuthMiddleware } from "../../../shared/infrastructure/middlewares/JwtAuthMiddleware.js";
import CreateRequestPostController from "./controllers/CreateRequestPostController.js";
import GetRequestsByBoardIdGetController from "./controllers/GetRequestsByBoardIdGetController.js";
import GetRequestByIdGetController from "./controllers/GetRequestByIdGetController.js";
import UpdateRequestPatchController from "./controllers/UpdateRequestPatchController.js";
import SubscribeToRequestPostController from "./controllers/SubscribeToRequestPostController.js";
import UnsubscribeFromRequestDeleteController from "./controllers/UnsubscribeFromRequestDeleteController.js";
import IsSubscribedToRequestGetController from "./controllers/IsSubscribedToRequestGetController.js";

const requestsRouter = Router();

// Public
requestsRouter.get("/", GetRequestsByBoardIdGetController);
requestsRouter.get("/:id", GetRequestByIdGetController);

// Protected
requestsRouter.post("/", JwtAuthMiddleware, CreateRequestPostController);
requestsRouter.patch("/:id", JwtAuthMiddleware, UpdateRequestPatchController);
requestsRouter.post("/:id/subscriptions", JwtAuthMiddleware, SubscribeToRequestPostController);
requestsRouter.delete("/:id/subscriptions", JwtAuthMiddleware, UnsubscribeFromRequestDeleteController);
requestsRouter.get("/:id/subscriptions", JwtAuthMiddleware, IsSubscribedToRequestGetController);

export default requestsRouter;
