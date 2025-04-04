import PrismaService from "@/db/prisma-service";
import { Prisma, PrismaClient } from "@prisma/client";

export default class BaseRepository {
  protected db: PrismaClient | Prisma.TransactionClient;

  constructor(db?: Prisma.TransactionClient) {
    this.db = db ?? PrismaService.getInstance();
  }
}
