import express, { Application } from "express";
import cors from "cors";
import { config } from "./config.js";
import helmet from "helmet";
import { apiLimiter } from "./middlewares/rateLimiter.js";

const app: Application = express();

app.set("trust proxy", 1); // NOTE: add handler for error 429 (Too Many Requests)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'", "'unsafe-inline'"], // Only if your React setup needs it
        "img-src": ["'self'", "data:", "https://your-cdn.com"], // Allow images from your CDN
        "connect-src": ["'self'", "https://api.yourdomain.com"],
      },
    },
  }),
);
app.use(apiLimiter);
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send(`Server running in ${config.nodeEnv} mode`);
});

// Use the port from our config
app.listen(config.port, () => {
  console.log(`🚀 Server buzzing on http://localhost:${config.port}`);
});
