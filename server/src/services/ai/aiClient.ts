import { config } from "../../config.js"
import { aiService } from "./llmClient.js";
import { callOpenRouter } from "./openrouterClient.js"



export const generateAiResponse = async (messages: any[], option?: string) => {
    if ( config.aiProvider === "openrouter" && option === "openrouter") {
        return await callOpenRouter(messages);
    } else {
        return await aiService.generateResponse(messages);
    }
}