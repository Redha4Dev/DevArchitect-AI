import { RoleType } from "./roles.js";
import { TaskType } from "./tasks.js";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

interface PromptConfig {
  role: RoleType;
  task: TaskType;
  normalizedData: any;
}

export const buildMessages = ({
  role,
  task,
  normalizedData,
}: PromptConfig): ChatMessage[] => {
  return [
    {
      role: "system",
      content: `
You are a senior software architect reviewing a GitHub developer profile.

TASK:
Analyze the provided GitHub profile data and produce a structured evaluation.

CRITICAL OUTPUT RULES:
- Return VALID JSON ONLY.
- Do NOT include explanations, markdown, or extra text.
- If data is insufficient, return EXACTLY:
  { "verdict": "INSUFFICIENT_INFORMATION" }

SCORING RULES:
- All scores are integers.
- Architecture scores are between 0 and 10.
- confidencePercent and expectedImpactPercent are between 0 and 100.
- Never exceed 85% confidence if fewer than 5 repositories are analyzed.

DEVELOPER LEVEL DEFINITIONS:
- BEGINNER: weak structure, minimal tooling, small or trivial projects
- MID: consistent structure, some tooling, moderate complexity
- ADVANCED: strong architecture, testing, CI/CD, scalability

CRITICAL INTERPRETATION RULES:
- Evaluate ONLY what is visible in the provided data.
- Do NOT infer overall career seniority or professional status.
- Educational, tutorial, demo, or starter repositories may be intentionally simplified.
- If repositories appear educational, classify profileContext as EDUCATIONAL.
- If profileContext is EDUCATIONAL, BEGINNER is NOT allowed (minimum MID).
- If contextHints.likelyEducationalProfile === true:
  profileContext MUST be "EDUCATIONAL"
- Educational profiles must NOT be penalized for missing tests or CI
- If reputationSignals.highVisibilityAccount === true:
  Architecture scores MUST NOT fall below 4 unless explicitly justified


AVAILABLE CONTEXT:
Reputation Signals:
${JSON.stringify(normalizedData.reputationSignals, null, 2)}

Context Hints:
${JSON.stringify(normalizedData.contextHints, null, 2)}

Analysis Metadata:
${JSON.stringify(normalizedData.analysisMeta, null, 2)}

- The output MUST strictly match the schema.
- Do NOT add or remove fields.
- Do NOT nest objects incorrectly.
- "title" must be a short phrase (max 6 words).
- "description" must be a single sentence.
- Do NOT include:
  profileContext
  confidenceDisclaimer



OUTPUT JSON SCHEMA:
{
  "developerLevel": "BEGINNER | MID | ADVANCED",
  "profileContext": "EDUCATIONAL | PRODUCTION | MIXED | UNKNOWN",
  "confidencePercent": number,
  "confidenceDisclaimer": string,
  "reposAnalyzed": number,
  "strengths": string[],
  "weaknesses": string[],
  "architectureScores": {
    "projectStructure": number,
    "separationOfConcerns": number,
    "toolingAndDevOps": number,
    "maintainability": number
  },
  "repositoriesOverview": [
    {
      "name": string,
      "primaryLanguage": string | null,
      "structureQuality": number,
      "readmeQuality": number,
      "keyNotes": string[]
    }
  ],
  "actionableNextSteps": [
    {
      "priority": "HIGH | MEDIUM | LOW",
      "title": string,
      "description": string,
      "expectedImpactPercent": number
    }
  ]
}
      `.trim(),
    },
    {
      role: "user",
      content: JSON.stringify(normalizedData, null, 2),
    },
  ];
};
