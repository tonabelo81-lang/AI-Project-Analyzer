import dotenv from "dotenv";
import path from "path";

dotenv.config();

export const CONFIG = {
  PORT: 3000,
  HOST: "0.0.0.0",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  APP_URL: process.env.APP_URL || "http://localhost:3000",
  NODE_ENV: process.env.NODE_ENV || "development",
  SCAN_DIR: process.env.SCAN_DIR ? path.resolve(process.env.SCAN_DIR) : process.cwd(),
};
