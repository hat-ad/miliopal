/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response } from "express";
import { ApiResponse } from "@/types/common";
import { getError } from "./common";

export const OK = (
  res: Response,
  result: any,
  message = "",
  code = true
): void => {
  const response: ApiResponse = {
    code,
    message: message || "",
    result: result || null,
  };
  res.status(200).json(response);
};

export const ERROR = (
  res: Response,
  result: any,
  error: any,
  code = false
): void => {
  const response: ApiResponse = {
    code,
    result,
    message: typeof error === "string" ? error : getError(error),
  };
  res.status(400).json(response);
};

export const UNAUTHORIZED = (
  res: Response,
  result: any,
  message = "Error",
  code = false
): void => {
  const response: ApiResponse = {
    code,
    message: message || "",
    result,
  };
  res.status(401).json(response);
};

export const BAD = (
  res: Response,
  result: any,
  error: any,
  code = false
): void => {
  const response: ApiResponse = {
    code,
    result,
    message: typeof error === "string" ? error : getError(error),
  };
  res.status(400).json(response);
};

export const UNKNOWN = (
  res: Response,
  result: any,
  message = "Error",
  code = false
): void => {
  const response: ApiResponse = {
    code,
    result,
    message: message || "",
  };
  res.status(500).json(response);
};
