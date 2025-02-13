import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCHEMA_DIR = path.join(__dirname, "models");
const MAIN_SCHEMA_FILE = path.join(__dirname, "schema.prisma");

const baseSchema = `
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
`;

async function mergeSchemas() {
  try {
    const schemaFiles = await fs.promises.readdir(SCHEMA_DIR);
    const schemaContents = await Promise.all(
      schemaFiles
        .filter((file) => file.endsWith(".prisma"))
        .map(async (file) => {
          const filePath = path.join(SCHEMA_DIR, file);
          return fs.promises.readFile(filePath, "utf8");
        })
    );

    const mergedSchema = [baseSchema, ...schemaContents].join("\n\n");
    await fs.promises.writeFile(MAIN_SCHEMA_FILE, mergedSchema);

    console.log("✅ Prisma schema merged successfully.");
  } catch (error) {
    console.error("❌ Error merging Prisma schemas:", error);
  }
}

mergeSchemas();
