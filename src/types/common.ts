import { Role } from "@prisma/client";

export interface ApiResponse {
  code: boolean;
  message: string;
  result: unknown;
}

export interface UserTokenPayload {
  id: string;
  email: string;
  role: Role;
  organizationId: string | null;
}

export const MonthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
