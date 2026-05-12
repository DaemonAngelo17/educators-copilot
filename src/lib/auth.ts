import { NextRequest } from "next/server";

export function getApiKeyFromHeaders(req: NextRequest, provider: string = "gemini") {
  const cleanKey = (key: string | null | undefined): string | undefined => {
    if (!key) return undefined;
    const trimmed = key.trim();
    if (trimmed === "" || trimmed === "null" || trimmed === "undefined" || trimmed === "default") return undefined;
    return trimmed;
  };

  // 1. Check for specific provider headers first
  const geminiKey = cleanKey(req.headers.get("x-gemini-key"));
  const openaiKey = cleanKey(req.headers.get("x-openai-key"));
  const anthropicKey = cleanKey(req.headers.get("x-anthropic-key"));
  const headerKey = cleanKey(req.headers.get("x-api-key"));

  let finalKey: string | undefined;
  if (provider === "openai") finalKey = openaiKey || headerKey;
  else if (provider === "anthropic") finalKey = anthropicKey || headerKey;
  else if (provider === "gemini") finalKey = geminiKey || headerKey;
  else finalKey = headerKey;

  // 2. Final fallback to environment variables if still undefined
  if (!finalKey && provider === "gemini") {
    finalKey = cleanKey(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
  } else if (!finalKey && provider === "openai") {
    finalKey = cleanKey(process.env.OPENAI_API_KEY);
  }

  return finalKey;
}

export function getProviderFromHeaders(req: NextRequest) {
  return req.headers.get("x-provider") || "gemini";
}
