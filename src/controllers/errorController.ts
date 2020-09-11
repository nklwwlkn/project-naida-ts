import { AppError } from "../utils/appError";
import { Request, Response, NextFunction } from "express";

/** Designs an error look when the app in the @development mode */
const sendErrorDev = (err: any, res: Response): void => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

/** Designs an error look when the app in the @production mode */
const sendErrorProd = (err: any, res: Response): void => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    /** programming or other unknown error: dont leak error details */
  } else {
    console.error("ERROR!");

    res.status(500).json({
      status: "error",
      message: "something went wrong",
    });
  }
};

/** Handles @database cast errors */
const handleCastErrorDB = (err: any): AppError => {
  let message: string;

  message = `There is no ${err.value}: ${err.path}`;

  return new AppError(message, 400);
};

/** Handles @database duplocate field errors   */
const handleDuplicateFieldsDB = (err: any): AppError => {
  let value: string;
  let message: string;

  value = err.errmsg.match(/"([^\\"]|\\")*"/)[0];
  message = `Duplicate field ${value}. Please use another field value`;

  return new AppError(message, 400);
};

/** Handles @database validation errors   */
const handleValidationErrorDB = (err: any): AppError => {
  let message: string;

  message = { ...err.message };

  return new AppError(message, 400);
};

/** Handles @JWT signature errors   */
const handleJWTError = (): AppError => new AppError("Invalid signature.", 401);

export default (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };

    if (error.name === "CastError") error = handleCastErrorDB(err);
    if (error.code === 11000) error = handleDuplicateFieldsDB(err);
    if (error.name === "ValidationError") error = handleValidationErrorDB(err);
    if (error.name === "JsonWebTokenError") error = handleJWTError();

    sendErrorProd(error, res);
  }
};
