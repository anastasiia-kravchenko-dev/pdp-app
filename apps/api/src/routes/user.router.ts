import { Router } from "express";
import {
  createUserController,
  deleteUserController,
  getUserByIdController,
  getUsersController,
} from "../controllers/user.controller.js";

export const userRouter = Router();

userRouter.get("/", getUsersController);
userRouter.get("/:id", getUserByIdController);
userRouter.post("/", createUserController);
userRouter.delete("/:id", deleteUserController);