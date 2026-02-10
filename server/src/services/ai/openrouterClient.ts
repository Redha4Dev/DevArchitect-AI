import axios from "axios";
import { config } from "../../config.js";

export const callOpenRouter = async (messages: any[]) => {
  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "gpt-4o-mini", // Free tier
        messages,
        temperature: 0.2,
        max_tokens: 600,
      },
      {
        headers: {
          Authorization: `Bearer ${config.openrouterApiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (err: any) {
    console.error("OpenRouter ERROR:", err.response?.data || err.message);
    throw new Error("Failed to get AI response from OpenRouter");
  }
};
