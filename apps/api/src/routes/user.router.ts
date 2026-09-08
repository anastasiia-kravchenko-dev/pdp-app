import { Router } from "express";
import {
  deleteUserController,
  getUserByIdController,
  getUsersController,
  updateUserController,
} from "../controllers/user.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { updateUserSchema, userIdParamsSchema } from "../schemas/user.schema.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

export const userRouter = Router();

userRouter.use(requireAuth);

userRouter.get("/", getUsersController);
userRouter.get("/:id", validate(userIdParamsSchema), getUserByIdController);
userRouter.patch(
  "/:id",
  validate(userIdParamsSchema),
  validate(updateUserSchema),
  updateUserController,
);
userRouter.delete("/:id", validate(userIdParamsSchema), deleteUserController);
