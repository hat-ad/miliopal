import { PrismaClient } from "@prisma/client";

class PrismaService {
  private static instance: PrismaClient;

  private constructor() {} // Private constructor to prevent instantiation

  public static getInstance(): PrismaClient {
    if (!PrismaService.instance) {
      PrismaService.instance = new PrismaClient({
        log: ["info", "warn", "error"],
      });
    }
    return PrismaService.instance;
  }

  public static async disconnect(): Promise<void> {
    if (PrismaService.instance) {
      await PrismaService.instance.$disconnect();
    }
  }
}

export default PrismaService;
