import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service.js";

export const registerController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.register(req.body);

    // user created
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.login(req.body);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const refreshTokenController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshToken(refreshToken);

    res.status(200).json(tokens);
  } catch (error) {
    next(error);
  }
};

export const logoutController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    const userId = authService.resolveUserIdFromRefreshToken(refreshToken);

    await authService.logout(userId);

    // 204 No Content
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getMyProfileController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.getMy(req.userId!);

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}
