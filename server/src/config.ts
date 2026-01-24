import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  dbUrl: process.env.DB_URL,
  apiKey: process.env.API_KEY,
};

// if (!config.dbUrl) {
//   throw new Error("❌ Missing DATABASE_URL in .env file");
// }
