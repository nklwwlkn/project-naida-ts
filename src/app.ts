import express, { Application } from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import compression from "compression";
import hpp from "hpp";

// Configs
import limiterConfig from "./configs/limiterConfig";
import hppConfig from "./configs/hppConfig";

// Utils
import { AppError } from "./utils/appError";

// Controllers
import globalErrorHandler from "./controllers/errorController";

// Routers
import userRouter from "./routes/userRoutes";
import petRouter from "./routes/petRoutes";

const app: Application = express();

// Express configuration
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(cookieParser());
app.use(compression());
app.use(helmet());
app.use(express.json());
app.use(mongoSanitize());
app.use(xss());
app.use("/api", rateLimit(limiterConfig));
app.use(hpp(hppConfig));

/**
 * API examples routes.
 */
app.use("/api/v1/users", userRouter);
app.use("/api/v1/pets", petRouter);

app.all("*", (req, res, next): void => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

/**
 * Error handler.
 */
app.use(globalErrorHandler);

export { app };
