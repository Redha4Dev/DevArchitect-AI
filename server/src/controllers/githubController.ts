import { NextFunction, Request, Response } from "express";
import {
  getReadme,
  getRepos,
  getRepoTree,
  getUser,
  rankGithubRepos,
} from "../services/github.service.js";
import { buildMessages } from "../services/ai/promptBuilder.js";
import { normalizeGithubData } from "../utils/normalizeGithub.js";
//import { aiService } from "../services/ai/llmClient.js";
import { RoleType } from "../services/ai/roles.js";
import { TaskType } from "../services/ai/tasks.js";
import { summarizeGithubForAI } from "../utils/summarizeGithub.js";
import { generateAiResponse } from "../services/ai/aiClient.js";
import { guardInputSize } from "../utils/guardInput.js";
import { withTimeout } from "../utils/withTimeout.js";
import { parseAIResponse } from "../utils/parseAIResponse.js";

export const analyzeGithubProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { username, option } = req.body;
  try {
    const user = await getUser(username);
    const repos = await getRepos(username);
    const topRepos = rankGithubRepos(repos, 5);

    const enrichedRepos = await Promise.all(
      topRepos.map(async (repo: any) => {
        const tree = await getRepoTree(
          user.login,
          repo.name,
          repo.default_branch,
        );
        //@ts-ignore
        const readme = await getReadme(user.login, topRepos.name);
        return { ...repo, tree, readme };
      }),
    );

    const normalized = normalizeGithubData(user, enrichedRepos);
    const summarized = summarizeGithubForAI(normalized);
    const safeSummarized = guardInputSize(summarized);

    if (
      normalized.repositories.length === 0 ||
      normalized.profile.publicRepos === 0
    ) {
      return res.status(200).json({
        status: "success",
        data: {
          verdict: "INSUFFICIENT_INFORMATION",
          message:
            "Not enough public GitHub data to perform a meaningful analysis.",
        },
      });
    }

    const messages = buildMessages({
      role: RoleType.ASSISTANT,
      task: TaskType.GITHUB_REVIEW,
      normalizedData: JSON.stringify(safeSummarized, null, 2),
    });

    const aiReview = await withTimeout(
      generateAiResponse(messages, option),
      60000,
    );
    // if the ai took more then 1 min the request will timeout

    // if (aiReview.includes("INSUFFICIENT_INFORMATION")) {
    //   return res.status(200).json({
    //     status: "success",
    //     data: {
    //       verdict: "INSUFFICIENT_INFORMATION",
    //       message:
    //         "The AI could not confidently analyze this profile due to limited data.",
    //     },
    //   });
    // }

    const aiResult = parseAIResponse(aiReview);

    if (aiResult.verdict === "INSUFFICIENT_INFORMATION") {
      return res.status(200).json({
        status: "success",
        data: {
          verdict: "INSUFFICIENT_INFORMATION",
          message:
            "The AI could not confidently analyze this profile due to limited data.",
        },
      });
    }

    res.status(200).json({ safeSummarized, normalized, aiResult, aiReview });
  } catch (error: any) {
    if (error.message === "AI_TIMEOUT") {
      return res.status(504).json({
        status: "error",
        code: "AI_TIMEOUT",
        message: "AI analysis takes too long. Please try again later",
      });
    }

    res.status(error.statusCode || 500).json({
      status: "error",
      code: error.code || "INTERNAL_ERROR",
      message: error.message || "Something went wrong",
    });

    next(error);
  }
};
