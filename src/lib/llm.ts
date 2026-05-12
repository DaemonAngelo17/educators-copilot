import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { GoogleGenerativeAI } from "@google/generative-ai";

export type LLMOptions = {
  provider: string;
  apiKey: string;
  temperature?: number;
  maxTokens?: number;
};

export function getLLM(options: LLMOptions) {
  const { provider, apiKey, temperature = 0.7, maxTokens } = options;

  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0 || apiKey === "null") {
    throw new Error(`API key for ${provider} is invalid or missing. Please ensure you have set a valid key in the Settings page.`);
  }

  switch (provider) {
    case "openai":
      return new ChatOpenAI({
        openAIApiKey: apiKey,
        modelName: "gpt-4o",
        temperature,
        maxTokens,
      });
    case "anthropic":
      return new ChatAnthropic({
        anthropicApiKey: apiKey,
        modelName: "claude-3-5-sonnet-20240620",
        temperature,
        maxTokens,
      });
    case "gemini":
    default:
      // Direct REST API wrapper to avoid LangChain SDK bugs and 404s
      const wrapper = {
        invoke: async (input: any) => {
          const key = apiKey.trim();
          // Use gemini-1.5-pro-latest for maximum compatibility
          const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${key}`;
          
          let prompt = "";
          if (typeof input === 'string') {
            prompt = input;
          } else if (input && typeof input === 'object') {
            prompt = input.lc_kwargs?.content || input.lc_value || JSON.stringify(input);
            if (input.context && input.query) {
              prompt = `Context: ${input.context}\n\nQuestion: ${input.query}`;
            }
          }

          const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: temperature,
                maxOutputTokens: maxTokens || 2048,
              }
            })
          });

          if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error?.message || `Gemini API Error: ${response.statusText}`);
          }

          const data = await response.json();
          let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI.";
          
          // Auto-extract JSON if it's wrapped in markdown code blocks
          if (text.includes("```json")) {
            const match = text.match(/```json\s*([\s\S]*?)\s*```/);
            if (match) text = match[1];
          } else if (text.includes("```")) {
            const match = text.match(/```\s*([\s\S]*?)\s*```/);
            if (match) text = match[1];
          }
          
          return text.trim();
        },
        pipe: (next: any): any => {
          const createChain = (first: any, second: any): any => ({
            invoke: async (input: any): Promise<any> => {
              const res = await first.invoke(input);
              return second.invoke(res);
            },
            pipe: (third: any): any => createChain(createChain(first, second), third)
          });
          return createChain(wrapper, next);
        }
      };
      return wrapper as any;
  }
}
