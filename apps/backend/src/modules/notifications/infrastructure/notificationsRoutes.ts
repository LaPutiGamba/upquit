import { Router } from "express";
import { JwtAuthMiddleware } from "../../../shared/infrastructure/middlewares/JwtAuthMiddleware.js";
import { TenantDbMiddleware } from "../../../shared/infrastructure/middlewares/TenantDbMiddleware.js";
import ListNotificationsGetController from "./controllers/ListNotificationsGetController.js";
import MarkNotificationReadPatchController from "./controllers/MarkNotificationReadPatchController.js";
import MarkAllReadPostController from "./controllers/MarkAllReadPostController.js";
import GetUnreadCountGetController from "./controllers/GetUnreadCountGetController.js";

const notificationsRouter = Router();

notificationsRouter.get("/", JwtAuthMiddleware, TenantDbMiddleware, ListNotificationsGetController);
notificationsRouter.get("/unread-count", JwtAuthMiddleware, TenantDbMiddleware, GetUnreadCountGetController);
notificationsRouter.patch("/:id/read", JwtAuthMiddleware, TenantDbMiddleware, MarkNotificationReadPatchController);
notificationsRouter.post("/read-all", JwtAuthMiddleware, TenantDbMiddleware, MarkAllReadPostController);

export default notificationsRouter;
