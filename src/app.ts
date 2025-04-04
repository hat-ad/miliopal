import api from "@/routes";
import logger from "@/utils/logger";
import cors from "cors";
import { config } from "dotenv";
import express, { Express, Request, Response } from "express";
import helmet from "helmet";
import path from "path";

config(); // Loads environment variables from .env file

const app: Express = express();

// DATABASE CONNECTION

app.use(helmet());
app.use(cors());
app.use(logger.apiLogger);

app.use(
  "/public",
  express.static(path.join(__dirname, "public"), {
    setHeaders(res: Response) {
      const now = new Date();
      const oneDayInMilliseconds = 24 * 60 * 60 * 1000;
      const expires = new Date(now.getTime() + oneDayInMilliseconds);

      res.set("x-timestamp", now.toString());
      res.set("Expires", expires.toUTCString());
      res.set("expires", expires.toUTCString());
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
      res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.set("Access-Control-Allow-Credentials", "true");
      res.set("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);

app.use(
  express.json({
    limit: "50mb",
    verify: (req: Request, _res: Response, buf) => {
      req.rawBody = buf.toString();
    },
  })
);
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use("/api", api);

import "./cron/private-seller-notif.cron";

export default app;
