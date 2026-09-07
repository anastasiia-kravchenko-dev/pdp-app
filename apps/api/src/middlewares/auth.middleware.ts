import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { HttpError } from "./error.middleware.js";

export const requireAuth = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next(new HttpError(401, "Missing access token"));
    return;
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    next(new HttpError(401, "Missing access token"));
    return;
  }

  let payload: string | jwt.JwtPayload;

  try {
    payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
  } catch (error) {
    next(new HttpError(401, "Invalid or expired access token"));
    return;
  }

  if (typeof payload === "string" || !payload.sub) {
    next(new HttpError(401, "Invalid or expired access token"));
    return;
  }

  req.userId = Number(payload.sub);

  next();
};
