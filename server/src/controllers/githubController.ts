import { NextFunction, Request, Response } from "express";
import {
  getReadme,
  getRepos,
  getRepoTree,
  getUser,
} from "../services/github.service.js";
import { buildMessages } from "../services/ai/promptBuilder.js";
import { normalizeGithubData } from "../utils/normalizeGithub.js";
import { aiService } from "../services/ai/llmClient.js";
import { RoleType } from "../services/ai/roles.js";
import { TaskType } from "../services/ai/tasks.js";

export const analyzeGithubProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { username } = req.body;
  try {
    const user = await getUser(username);
    const repos = await getRepos(username);

    const enrichedRepos = await Promise.all(
      repos.map(async (repo: any) => {
        const tree = await getRepoTree(
          user.login,
          repo.name,
          repo.default_branch,
        );

        const readme = await getReadme(user.login, repo.name);
        return { ...repo, tree, readme };
      }),
    );

    const normalized = normalizeGithubData(user, enrichedRepos);

    const messages = buildMessages({
      role: RoleType.ASSISTANT,
      task: TaskType.GITHUB_REVIEW,
      input: JSON.stringify(normalized, null, 2),
    });

    const aiReview = await aiService.generateResponse(messages);

    res.status(200).json({ aiReview, normalized });
  } catch (error) {
    next(error);
  }
};
