import { Router } from "express";
import CreateUserPostController from "./controllers/CreateUserPostController.js";
import GetUserByIdGetController from "./controllers/GetUserByIdGetController.js";
import GetUserByEmailGetController from "./controllers/GetUserByEmailGetController.js";
import UpdateUserPatchController from "./controllers/UpdateUserPatchController.js";
import DeactivateUserPostController from "./controllers/DeactivateUserPostController.js";
import VerifyUserEmailPostController from "./controllers/VerifyUserEmailPostController.js";
import AuthenticateUserPostController from "./controllers/AuthenticateUserPostController.js";

const usersRouter = Router();

usersRouter.post("/register", CreateUserPostController);
usersRouter.post("/login", AuthenticateUserPostController);
usersRouter.get("/", GetUserByEmailGetController);
usersRouter.get("/:id", GetUserByIdGetController);
usersRouter.patch("/:id", UpdateUserPatchController);
usersRouter.post("/:id/deactivate", DeactivateUserPostController);
usersRouter.post("/:id/verify-email", VerifyUserEmailPostController);

export default usersRouter;
