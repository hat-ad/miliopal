import { Role } from "@prisma/client";

export interface UserTokenPayload {
  id: string;
  email: string;
  role: Role;
  organizationId: string | null;
}
