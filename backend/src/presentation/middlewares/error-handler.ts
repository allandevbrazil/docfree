import { Request, Response, NextFunction } from "express";

/**
 * Global Error Handler Middleware
 *
 * Centralizes error handling for the entire application.
 * Returns consistent JSON error responses.
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        message: err.message,
        statusCode: err.statusCode,
      },
    });
    return;
  }

  console.error("Unhandled error:", err);

  res.status(500).json({
    error: {
      message: "Internal server error",
      statusCode: 500,
    },
  });
}