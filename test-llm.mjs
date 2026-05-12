import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

try {
  const llm = new ChatGoogleGenerativeAI({
    apiKey: "null",
    modelName: "gemini-1.5-pro",
  });
  console.log("Success");
} catch(e) {
  console.log("Error:", e.message);
}
