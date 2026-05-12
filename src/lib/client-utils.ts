export function getAuthHeaders() {
  const key = typeof window !== "undefined" ? localStorage.getItem("gemini_api_key") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  if (key) {
    headers["x-api-key"] = key;
  }
  
  return headers;
}
