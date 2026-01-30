import { NextFunction, Request, Response } from "express";
import { config } from "../config.js";
import { aiService } from "../services/ai/llmClient.js";
import { AppError } from "../utils/AppError.js";
import { buildMessages } from "../services/ai/promptBuilder.js";
import { RoleType } from "../services/ai/roles.js";
import { TaskType } from "../services/ai/tasks.js";

export const chatWithAI = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { message, role, task } = req.body as {
      message: string;
      role: RoleType;
      task: TaskType;
    };

    if (!message || !role || !task) {
      return next(
        new AppError("Please provide message, role, and task", 400)
      );
    }

    // ✅ Build chat-native prompt
    const messages = buildMessages({
      role,
      task,
      input: message,
    });

    // ✅ Send messages directly to LLM
    const reply = await aiService.generateResponse(messages);

    res.status(200).json({
      status: "success",
      data: {
        reply,
        model: config.olamaModel,
      },
    });
  } catch (err) {
    next(err);
  }
};
