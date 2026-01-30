import { RoleType } from "./roles.js";
import { TaskType } from "./tasks.js";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

interface PromptConfig {
  role: RoleType;
  task: TaskType;
  input: string;
}

export const buildMessages = ({
  role,
  task,
  input,
}: PromptConfig): ChatMessage[] => {
  return [
    {
      role: "system",
      content: `
You are a ${role}.

Your task is: ${task}

Rules:
- Be honest and constructive.
- Base your analysis ONLY on the provided data.
- Do NOT hallucinate.
- Respond in well-structured Markdown.
- Give actionable recommendations.
      `.trim(),
    },
    {
      role: "user",
      content: input,
    },
  ];
};
