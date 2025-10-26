import type {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express";
import { ValidationError } from "sequelize";
import ApiError from "../utils/response/apiError";
// import { ApiError as ServiceApiError } from '../services/refreshService'; // Keep old one

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error("Global Error Handler:", err.stack);

  // --- Handle our new custom ApiError ---
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: err.message,
      ...(err.details && { details: err.details }), // Add details if they exist
    });
  }

  // Handle 503 Service Unavailable from refreshService (as per original spec)
  //   if (err instanceof ServiceApiError) {
  //     return res.status(err.statusCode).json({
  //       error: err.message,
  //       details: err.details,
  //     });
  //   }

  // Handle Sequelize Validation Errors (as per original spec)
  if (err instanceof ValidationError) {
    const details = err.errors.reduce((acc, error) => {
      acc[error.path!] = error.message.replace(`${error.path} `, "");
      return acc;
    }, {} as { [key: string]: string });

    return res.status(400).json({
      error: "Validation failed",
      details: details,
    });
  }

  // --- Default 500 Internal Server Error ---
  return res.status(500).json({
    error: "Internal server error",
    details: err.message || "An unknown error occurred",
  });
};
