import { Router } from "express";
import CreateRequestPostController from "./controllers/CreateRequestPostController.js";
import GetRequestsByBoardIdGetController from "./controllers/GetRequestsByBoardIdGetController.js";
import GetRequestByIdGetController from "./controllers/GetRequestByIdGetController.js";
import UpdateRequestPatchController from "./controllers/UpdateRequestPatchController.js";
import SubscribeToRequestPostController from "./controllers/SubscribeToRequestPostController.js";
import UnsubscribeFromRequestDeleteController from "./controllers/UnsubscribeFromRequestDeleteController.js";
import IsSubscribedToRequestGetController from "./controllers/IsSubscribedToRequestGetController.js";

const requestsRouter = Router();

requestsRouter.post("/", CreateRequestPostController);
requestsRouter.get("/", GetRequestsByBoardIdGetController);
requestsRouter.get("/:id", GetRequestByIdGetController);
requestsRouter.patch("/:id", UpdateRequestPatchController);
requestsRouter.post("/:id/subscriptions", SubscribeToRequestPostController);
requestsRouter.delete("/:id/subscriptions", UnsubscribeFromRequestDeleteController);
requestsRouter.get("/:id/subscriptions", IsSubscribedToRequestGetController);

export default requestsRouter;
