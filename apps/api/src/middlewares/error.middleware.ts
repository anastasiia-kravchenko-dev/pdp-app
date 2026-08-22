import type { NextFunction, Request, Response } from "express";

export class HttpError extends Error {
  public readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const statusCode = err instanceof HttpError ? err.statusCode : 500;
  const message =
    err instanceof Error ? err.message : "Internal Server Error";

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    status: "error",
    message,
  });
};
