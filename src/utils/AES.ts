import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const ALGORITHM = "aes-256-cbc";
const ENCODING = "utf8";
const OUTPUT_ENCODING = "base64";

if (!process.env.SECRET_KEY || !process.env.IV) {
  throw new Error("Missing SECRET_KEY or IV in environment variables");
}

if (process.env.SECRET_KEY.length !== 32) {
  throw new Error("SECRET_KEY must be exactly 32 characters long");
}

if (process.env.IV.length !== 16) {
  throw new Error("IV must be exactly 16 characters long");
}

const secretKey = Buffer.from(process.env.SECRET_KEY, "utf-8"); // 32 bytes
const iv = Buffer.from(process.env.IV, "utf-8"); // 16 bytes

export const encrypt = (text: string) => {
  const cipher = crypto.createCipheriv(ALGORITHM, secretKey, iv);
  let encrypted = cipher.update(text, ENCODING, OUTPUT_ENCODING);
  encrypted += cipher.final(OUTPUT_ENCODING);
  return encrypted;
};

export const decrypt = (encryptedText: string) => {
  const decipher = crypto.createDecipheriv(ALGORITHM, secretKey, iv);
  let decrypted = decipher.update(encryptedText, OUTPUT_ENCODING, ENCODING);
  decrypted += decipher.final(ENCODING);
  return decrypted;
};
