import type { ErrorHandler } from "hono";
import { ZodError } from "zod";
import { AppError } from "../lib/errors";

export const errorHandler: ErrorHandler = (err, c) => {
  if (err instanceof AppError) {
    return c.json(
      {
        success: false,
        message: err.message,
      },
      err.statusCode
    );
  }

  if (err instanceof ZodError) {
    const firstIssue = err.issues[0];
    const message = firstIssue?.message || "Data input tidak valid";
    return c.json(
      {
        success: false,
        message,
      },
      400
    );
  }

  console.error(err);
  return c.json(
    {
      success: false,
      message: "Terjadi kesalahan internal pada server",
    },
    500
  );
};
