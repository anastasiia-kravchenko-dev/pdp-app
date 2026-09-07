import { Router } from "express";
import {
  deleteUserController,
  getUserByIdController,
  getUsersController,
  updateUserController,
} from "../controllers/user.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { updateUserSchema } from "../schemas/user.schema.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

export const userRouter = Router();

userRouter.use(requireAuth);

userRouter.get("/", getUsersController);
userRouter.get("/:id", getUserByIdController);
userRouter.patch("/:id", validate(updateUserSchema), updateUserController);
userRouter.delete("/:id", deleteUserController);
