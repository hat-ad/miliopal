import "reflect-metadata";

import http from "http";
import { Request, Response } from "express";
import { Server } from "http";

import app from "./app";
import logger from "@/utils/logger";

const port: number = process.env.PORT || 8000;

const server: Server = http.createServer(app);

app.use((req: Request, res: Response) => {
  res.status(500).json({
    code: false,
    message: "Invalid Api.",
  });
});

const onError = (error: NodeJS.ErrnoException) => {
  if (error.syscall !== "listen") {
    throw error;
  }
  const addr = server.address();
  const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${port}`;
  switch (error.code) {
    case "EACCES":
      logger.error(`${bind} requires elevated privileges`);
      process.exit(1);
    case "EADDRINUSE":
      logger.error(`${bind} is already in use`);
      process.exit(1);
    default:
      throw error;
  }
};

const onListening = () => {
  const addr = server.address();
  const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${port}`;
  logger.info(`Listening on ${bind}`);
};

server.on("error", onError);
server.on("listening", onListening);

server.listen(port, () => {
  logger.info(
    `Server Started:\n>> http://localhost:${port}\n>> ${process.env.NODE_ENV} mode\n\n`
  );
});
