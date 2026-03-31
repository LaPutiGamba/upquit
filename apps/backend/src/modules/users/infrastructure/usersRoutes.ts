import { Router } from "express";
import CreateUserPostController from "./controllers/CreateUserPostController.js";
import GetUserByIdGetController from "./controllers/GetUserByIdGetController.js";
import GetUserByEmailGetController from "./controllers/GetUserByEmailGetController.js";
import UpdateUserPatchController from "./controllers/UpdateUserPatchController.js";
import VerifyUserEmailPostController from "./controllers/VerifyUserEmailPostController.js";

const usersRouter = Router();

usersRouter.post("/", CreateUserPostController);
usersRouter.get("/", GetUserByEmailGetController);
usersRouter.get("/:id", GetUserByIdGetController);
usersRouter.patch("/:id", UpdateUserPatchController);
usersRouter.post("/:id/verify-email", VerifyUserEmailPostController);

export default usersRouter;
