const dotenv = require("dotenv");
dotenv.config({ path: require("find-config")(".env") });

import mongoose from "mongoose";

import mongooseConfig from "./configs/mongooseConfig";

/**
 * Handle uncaughtExceptions.
 */
process.on("uncaughtException", (err: Error): void => {
  console.log("uncaughtException");
  console.log(err.name, err.message, err.stack);
  process.exit(1);
});

import { app } from "./app";
import { Application } from "express";
import { Server } from "tls";

/**
 * Connect to MongoDB.
 */
const MongoURI: string = process.env["DATABASE"]!.replace(
  "<password>",
  process.env["DATABASE_PASSWORD"]!
);

/**
 * Connect to MongoDB.
 */
mongoose
  .connect(MongoURI, mongooseConfig)
  .then((): void => {
    console.log("Mongo connection is established");
  })
  .catch((err): void => {
    console.log(
      `MongoDB connection error. Please make sure MongoDB is running. ${err}`
    );
  });

/**
 * Start express server.
 */
const port: number = Number(process.env.PORT!) || 3000;

const server = app.listen(port, (): void => {
  console.log(
    `\nApp running at http://localhost:${port}, in ${process.env["NODE_ENV"]} mode`
  );
  console.log("Press CTRL+C to stop\n");
});

/**
 * Handle unhandledRejection.
 */
process.on("unhandledRejection", (err: Error): void => {
  console.log("unhandledRejection");
  console.log(err.name, err.message, err.stack);

  server.close((): void => {
    process.exit(1);
  });
});
