/* eslint-disable no-param-reassign */
// eslint-disable-next-line no-unused-vars
import { AppError } from "../utils/appError";

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    /* 
    programming or other unknown error: dont leak error details */
  } else {
    // eslint-disable-next-line no-console
    console.error("ERROR!");

    res.status(500).json({
      status: "error",
      message: "something went wrong",
    });
  }
};

const handleCastErrorDB = (err) => {
  const message = `There is no ${err.value}: ${err.path}`;

  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/"([^\\"]|\\")*"/)[0];
  const message = `Duplicate field ${value}. Please use another field value`;

  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const message = { ...err.message };
  return new AppError(message, 400);
};

const handleJWTError = () => new AppError("Invalid signature.", 401);

export default (err, req, res, next) => {
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
