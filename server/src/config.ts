import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  dbUrl: process.env.DB_URL,
  apiKey: process.env.API_KEY,
  jwtSecret: process.env.JWT_SECRET || "secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "15d",
  mongoUrl: process.env.MONGO_URL || "mongodb://localhost:27017",
  olamaHost: process.env.OLAMA_HOST || "http://localhost:11434",
  olamaModel: process.env.OLAMA_MODEL || "mistral-local",
  githubToken: process.env.GITHUB_TOKEN,
  aiProvider: process.env.AI_PROVIDER || "local",
  openrouterApiKey: process.env.OPENROUTER_API_KEY,
};
// if (!config.dbUrl) {
//   throw new Error("❌ Missing DATABASE_URL in .env file");
// }
