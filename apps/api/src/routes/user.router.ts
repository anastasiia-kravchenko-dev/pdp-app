import { Router } from "express";
import {
  createUserController,
  deleteUserController,
  getUserByIdController,
  getUsersController,
} from "../controllers/user.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createUserSchema } from "../schemas/user.schema.js";

export const userRouter = Router();

userRouter.get("/", getUsersController);
userRouter.get("/:id", getUserByIdController);
userRouter.post("/", validate(createUserSchema), createUserController);
userRouter.delete("/:id", deleteUserController);
