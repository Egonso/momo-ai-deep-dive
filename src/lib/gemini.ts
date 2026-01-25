import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";

// Ensure API Key is present
const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
    // Warn but don't crash, might be build time
    console.warn("Missing GEMINI_API_KEY");
}

const genAI = new GoogleGenerativeAI(apiKey || "");
const fileManager = new GoogleAIFileManager(apiKey || "");

// Model configuration for Gemini 3 Flash
export const model = genAI.getGenerativeModel({
    model: "gemini-3-flash", // Using the specific model requested
    generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
    },
});

export { genAI, fileManager };
