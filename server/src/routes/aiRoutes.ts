import { Router } from "express";
import { authMiddelware } from "../middlewares/authMiddelware.js";
import { apiLimiter } from "../middlewares/rateLimiter.js";
import { chatWithAI } from "../controllers/aiController.js";

const AIRouter = Router();

//AIRouter.use(authMiddelware);

AIRouter.post("/chat", apiLimiter, chatWithAI);

export default AIRouter;