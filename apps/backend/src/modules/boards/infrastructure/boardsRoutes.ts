import { Router } from "express";
import { JwtAuthMiddleware } from "../../../shared/infrastructure/middlewares/JwtAuthMiddleware.js";
import { TenantDbMiddleware } from "../../../shared/infrastructure/middlewares/TenantDbMiddleware.js";
import CreateBoardPostController from "./controllers/CreateBoardPostController.js";
import GetBoardBySlugGetController from "./controllers/GetBoardBySlugGetController.js";
import GetBoardsByUserGetController from "./controllers/GetBoardsByUserGetController.js";
import GetBoardByIdGetController from "./controllers/GetBoardByIdGetController.js";
import UpdateBoardPatchController from "./controllers/UpdateBoardPatchController.js";
import GetBoardCategoriesGetController from "./controllers/GetBoardCategoriesGetController.js";
import AddBoardCategoryPostController from "./controllers/AddBoardCategoryPostController.js";
import GetBoardMembersGetController from "./controllers/GetBoardMembersGetController.js";
import AddBoardMemberPostController from "./controllers/AddBoardMemberPostController.js";
import RemoveBoardMemberDeleteController from "./controllers/RemoveBoardMemberDeleteController.js";
import UpdateBoardMemberRolePatchController from "./controllers/UpdateBoardMemberRolePatchController.js";

const boardsRouter = Router();

// Protected
boardsRouter.get("/mine", JwtAuthMiddleware, TenantDbMiddleware, GetBoardsByUserGetController);
boardsRouter.get("/slug/:slug", JwtAuthMiddleware, GetBoardBySlugGetController);
boardsRouter.post("/", JwtAuthMiddleware, TenantDbMiddleware, CreateBoardPostController);
boardsRouter.patch("/:id", JwtAuthMiddleware, TenantDbMiddleware, UpdateBoardPatchController);
boardsRouter.post("/:id/categories", JwtAuthMiddleware, TenantDbMiddleware, AddBoardCategoryPostController);
boardsRouter.post("/:id/members", JwtAuthMiddleware, TenantDbMiddleware, AddBoardMemberPostController);
boardsRouter.patch(
  "/:boardId/members/:userId",
  JwtAuthMiddleware,
  TenantDbMiddleware,
  UpdateBoardMemberRolePatchController
);
boardsRouter.delete(
  "/:boardId/members/:userId",
  JwtAuthMiddleware,
  TenantDbMiddleware,
  RemoveBoardMemberDeleteController
);

// Public
boardsRouter.get("/:id", GetBoardByIdGetController);
boardsRouter.get("/:id/categories", GetBoardCategoriesGetController);
boardsRouter.get("/:id/members", GetBoardMembersGetController);

export default boardsRouter;
