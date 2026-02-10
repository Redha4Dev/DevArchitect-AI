import express, { Application } from "express";
import cors from "cors";
import { config } from "./config.js";
import helmet from "helmet";
import { apiLimiter } from "./middlewares/rateLimiter.js";
import { login, register } from "./controllers/authController.js";
import { authMiddelware } from "./middlewares/authMiddelware.js";
import { connectDB } from "./db.js";
import AIRouter from "./routes/aiRoutes.js";
import githubRouter from "./routes/githubRoutes.js";
import authRouter from "./routes/authRoutes.js";

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

connectDB();

// Use the port from our config
app.listen(config.port, () => {
  console.log(`🚀 Server buzzing on http://localhost:${config.port}`);
});

app.use("/api/github", githubRouter);
app.use("/api/ai", AIRouter);
app.use("/", authRouter);

// PROTECTED ROUTES
app.get("/api/dashboard", authMiddelware, (req, res) => {
  res.json({
    status: "success",
    message: `Welcome back, User ID: ${(req.user as any).id}`,
    secretData: "Only logged in users can see this!",
  });
});
