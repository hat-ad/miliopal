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
