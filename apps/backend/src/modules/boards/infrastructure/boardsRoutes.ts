import { Router } from "express";
import CreateBoardPostController from "./controllers/CreateBoardPostController.js";
import GetBoardByIdGetController from "./controllers/GetBoardByIdGetController.js";
import GetBoardBySlugGetController from "./controllers/GetBoardBySlugGetController.js";
import UpdateBoardPatchController from "./controllers/UpdateBoardPatchController.js";
import AddBoardMemberPostController from "./controllers/AddBoardMemberPostController.js";
import GetBoardMembersGetController from "./controllers/GetBoardMembersGetController.js";
import AddBoardCategoryPostController from "./controllers/AddBoardCategoryPostController.js";
import GetBoardCategoriesGetController from "./controllers/GetBoardCategoriesGetController.js";

const boardsRouter = Router();

boardsRouter.post("/", CreateBoardPostController);
boardsRouter.get("/", GetBoardBySlugGetController);
boardsRouter.get("/:id", GetBoardByIdGetController);
boardsRouter.patch("/:id", UpdateBoardPatchController);
boardsRouter.post("/:id/members", AddBoardMemberPostController);
boardsRouter.get("/:id/members", GetBoardMembersGetController);
boardsRouter.post("/:id/categories", AddBoardCategoryPostController);
boardsRouter.get("/:id/categories", GetBoardCategoriesGetController);

export default boardsRouter;
