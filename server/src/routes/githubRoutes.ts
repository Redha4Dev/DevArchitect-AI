import express from "express";
import { analyzeGithubProfile } from "../controllers/githubController.js";

const githubRouter = express.Router();

githubRouter.post("/analyze-github", analyzeGithubProfile);

export default githubRouter;
