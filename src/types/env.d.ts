import { UserTokenPayload } from "./common";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: string;
      DEV_CONNECTION_STRING: string;
      STAGE_CONNECTION_STRING: string;
      PROD_CONNECTION_STRING: string;
      SECRET: string;
      PORT: number;
    }
  }

  namespace Express {
    interface Request {
      payload?: UserTokenPayload;
      rawBody: string;
    }
  }
}

export {};
