import dotenv from "dotenv";

dotenv.config();

export const CONFIG = {
  PORT: 3000,
  HOST: "0.0.0.0",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  APP_URL: process.env.APP_URL || "http://localhost:3000",
  NODE_ENV: process.env.NODE_ENV || "development",
};
