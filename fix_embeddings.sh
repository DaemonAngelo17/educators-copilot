for file in src/app/api/search/route.ts src/app/api/lesson-plan/route.ts src/app/api/implications/route.ts src/app/api/extras/route.ts; do
  sed -i '' 's/await searchVectorStore(query, 5, req.headers.get("x-gemini-key") || undefined)/await searchVectorStore(query, 5, embedKey, embedProvider)/g' "$file"
  sed -i '' 's/const apiKey = getApiKeyFromHeaders(req, provider);/const apiKey = getApiKeyFromHeaders(req, provider);\n    const embedProvider = provider === "anthropic" ? "gemini" : provider;\n    const embedKey = provider === "anthropic" ? (req.headers.get("x-gemini-key") || undefined) : apiKey;/g' "$file"
done
