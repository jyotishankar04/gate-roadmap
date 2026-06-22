import { ChatOpenAI } from "@langchain/openai";

export function isAiEnabled() {
  return Boolean(process.env.OPENAI_API_KEY);
}

export function getChatModel() {
  if (!process.env.OPENAI_API_KEY) return null;

  return new ChatOpenAI({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    apiKey: process.env.OPENAI_API_KEY,
    temperature: 0.2,
  });
}
