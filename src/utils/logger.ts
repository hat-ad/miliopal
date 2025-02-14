import { NextFunction, Request, Response } from "express";
import pino from "pino";

class LoggerService {
  private logger;

  constructor() {
    this.logger = pino({
      level:
        process.env.LOG_LEVEL ||
        (process.env.NODE_ENV === "production" ? "info" : "debug"),
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true, // Enable colorization
          translateTime: "yyyy-mm-dd HH:MM:ss", // Time format
          ignore: "pid,hostname", // Ignore pid and hostname fields
          messageFormat: "{msg}", // Only the message
        },
      },
    });
  }

  info = (message: string, meta?: Record<string, unknown>) => {
    this.logger.info(meta ?? {}, message);
  };

  warn = (message: string, meta?: Record<string, unknown>) => {
    this.logger.warn(meta ?? {}, message);
  };

  error = (message: string, meta?: Record<string, unknown>) => {
    this.logger.error(meta ?? {}, message);
  };

  debug = (message: string, meta?: Record<string, unknown>) => {
    this.logger.debug(meta ?? {}, message);
  };

  child(meta: Record<string, unknown>) {
    return this.logger.child(meta);
  }

  apiLogger = (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    // Log the incoming request
    this.info(`${req.method} ${req.originalUrl}`);

    res.on("finish", () => {
      const duration = Date.now() - startTime;
      let logMessage = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;

      // Log the details after the response is sent
      this.info(logMessage, {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
      });
    });

    next();
  };
}

// Export the singleton instance
export default new LoggerService();
