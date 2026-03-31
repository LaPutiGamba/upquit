import { Router } from "express";
import CreateCommentPostController from "./controllers/CreateCommentPostController.js";
import GetCommentsByRequestIdGetController from "./controllers/GetCommentsByRequestIdGetController.js";
import GetCommentsByParentIdGetController from "./controllers/GetCommentsByParentIdGetController.js";
import GetCommentByIdGetController from "./controllers/GetCommentByIdGetController.js";
import UpdateCommentPatchController from "./controllers/UpdateCommentPatchController.js";
import DeleteCommentDeleteController from "./controllers/DeleteCommentDeleteController.js";

const commentsRouter = Router();

commentsRouter.post("/", CreateCommentPostController);
commentsRouter.get("/", GetCommentsByRequestIdGetController);
commentsRouter.get("/replies", GetCommentsByParentIdGetController);
commentsRouter.get("/:id", GetCommentByIdGetController);
commentsRouter.patch("/:id", UpdateCommentPatchController);
commentsRouter.delete("/:id", DeleteCommentDeleteController);

export default commentsRouter;
