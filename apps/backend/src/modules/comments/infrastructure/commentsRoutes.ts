import { Router } from "express";
import { JwtAuthMiddleware } from "../../../shared/infrastructure/middlewares/JwtAuthMiddleware.js";
import CreateCommentPostController from "./controllers/CreateCommentPostController.js";
import GetCommentsByRequestIdGetController from "./controllers/GetCommentsByRequestIdGetController.js";
import GetCommentsByParentIdGetController from "./controllers/GetCommentsByParentIdGetController.js";
import GetCommentByIdGetController from "./controllers/GetCommentByIdGetController.js";
import UpdateCommentPatchController from "./controllers/UpdateCommentPatchController.js";
import DeleteCommentDeleteController from "./controllers/DeleteCommentDeleteController.js";

const commentsRouter = Router();

// Public
commentsRouter.get("/", GetCommentsByRequestIdGetController);
commentsRouter.get("/replies", GetCommentsByParentIdGetController);
commentsRouter.get("/:id", GetCommentByIdGetController);

// Protected
commentsRouter.post("/", JwtAuthMiddleware, CreateCommentPostController);
commentsRouter.patch("/:id", JwtAuthMiddleware, UpdateCommentPatchController);
commentsRouter.delete("/:id", JwtAuthMiddleware, DeleteCommentDeleteController);

export default commentsRouter;
