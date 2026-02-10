export const parseAIResponse = (raw: string) => {
  try {
    const parsed = JSON.parse(raw);

    if (parsed.verdict === "INSUFFICIENT_INFORMATION") {
      return parsed;
    }

    // Minimal structural validation
    if (
      !parsed.developerLevel ||
      !parsed.architectureScores ||
      !Array.isArray(parsed.repositoriesOverview)
    ) {
      throw new Error("INVALID_AI_RESPONSE");
    }

    return parsed;
  } catch {
    return {
      verdict: "AI_RESPONSE_INVALID",
      message:
        "The AI returned an unexpected response format. Please retry.",
    };
  }
};
