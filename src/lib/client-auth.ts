export function getAuthHeaders() {
  const geminiKey = localStorage.getItem("gemini_api_key") || "";
  const openaiKey = localStorage.getItem("openai_api_key") || "";
  const anthropicKey = localStorage.getItem("anthropic_api_key") || "";
  const provider = localStorage.getItem("preferred_provider") || "gemini";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-provider": provider,
    "x-gemini-key": geminiKey,
    "x-openai-key": openaiKey,
    "x-anthropic-key": anthropicKey,
  };

  // For backward compatibility or general key
  if (provider === "gemini") headers["x-api-key"] = geminiKey;
  if (provider === "openai") headers["x-api-key"] = openaiKey;
  if (provider === "anthropic") headers["x-api-key"] = anthropicKey;

  return headers;
}
