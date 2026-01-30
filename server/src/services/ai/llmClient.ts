import { Ollama } from "ollama";
import { config } from "../../config.js";
import { AppError } from "../../utils/AppError.js";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

class AIService {
  private client: Ollama;
  private model: string;

  constructor() {
    this.client = new Ollama({ host: config.olamaHost });
    this.model = config.olamaModel;
  }

  /** Generate response using pre-built chat messages */
  async generateResponse(messages: ChatMessage[]) {
    try {
      const response = await this.client.chat({
        model: this.model,
        messages,
        stream: false,
      });

      return response.message.content;
    } catch (error: any) {
      console.error("AI Service ERROR:", error);

      if (error.code === "ECONNREFUSED") {
        throw new AppError(
          "AI core is currently offline, please try again later",
          503
        );
      }

      throw new AppError("Failed to generate AI response", 500);
    }
  }

  /** Check if the model is running */
  async checkHealth() {
    try {
      await this.client.list();
      return true;
    } catch {
      return false;
    }
  }
}

export const aiService = new AIService();
