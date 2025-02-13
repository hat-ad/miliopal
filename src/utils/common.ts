import axios, { AxiosError } from "axios";

export function getError(error: unknown): string {
  try {
    if (axios.isAxiosError(error)) {
      const err = error as AxiosError;
      const errData = err.response?.data as Record<string, string>;
      return errData?.message ?? err.message;
    }
    return (error as Error).toString();
  } catch (e) {
    try {
      return JSON.stringify(error);
    } catch (e) {
      return "Some error occurred";
    }
  }
}
