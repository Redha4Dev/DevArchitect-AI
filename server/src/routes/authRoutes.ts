import { Router } from "express";
import { login, register } from "../controllers/authController.js";
import { authMiddelware } from "../middlewares/authMiddelware.js";

const authRouter = Router();

authRouter.post("/api/register", register); // You should add Zod validation here!
authRouter.post("/api/login", login); // Rate limited for security
authRouter.get("/api/profile", authMiddelware, (req, res) => {
  res.json(req.user);
});

export default authRouter;
