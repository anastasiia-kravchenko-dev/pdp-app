import { Router } from "express";
import {
  getMyProfileController,
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
} from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  loginSchema,
  refreshTokenSchema,
  registerSchema,
} from "../schemas/auth.schema.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

export const authRouter = Router();

authRouter.post("/register", validate(registerSchema), registerController);
authRouter.post("/login", validate(loginSchema), loginController);
authRouter.post(
  "/refresh",
  validate(refreshTokenSchema),
  refreshTokenController,
);
authRouter.post("/logout", validate(refreshTokenSchema), logoutController);
authRouter.get("/me", requireAuth, getMyProfileController);
