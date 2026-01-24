import { Response, Request, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";
import { ZodError } from "zod";

export const globalErrorHandler = (
  err: AppError | Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      status: "fail",
      message: "Validation Error",
      errors: err.errors.map((e: any) => ({
        path: e.path.join("."),
        message: e.message,
      })),
    });
  }

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Send response
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    // Only show stack trace in development mode
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
