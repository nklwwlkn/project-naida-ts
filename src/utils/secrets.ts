import logger from "./logger";
import dotenv from "dotenv";
import fs from "fs";

if (fs.existsSync(".env")) {
  logger.debug("Using .env file to supply config environment variables");
  dotenv.config({ path: ".env" });
} else {
  logger.debug("Create .env file");
}
export const ENVIRONMENT = process.env.NODE_ENV;
const prod = ENVIRONMENT === "production"; // Anything else is treated as 'dev'

export const JWT_SECRET = process.env["JWT_SECRET"];
export const DATABASE = process.env["DATABASE"];

if (!JWT_SECRET) {
  logger.error("No jwt secret. Set JWT_SECRET environment variable.");
  process.exit(1);
}

if (!DATABASE) {
  logger.error(
    "No mongo connection string. Set MONGODB_URI environment variable."
  );
  process.exit(1);
}

export default logger;
