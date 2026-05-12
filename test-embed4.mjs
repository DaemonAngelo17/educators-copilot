import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function test() {
  const embed = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    model: "text-embedding-004",
  });
  
  try {
    console.log("Testing embedDocuments (batch)...");
    await embed.embedDocuments(["test document 1", "test document 2"]);
    console.log("Batch SUCCESS");
    
    console.log("Testing embedQuery (single)...");
    await embed.embedQuery("test query");
    console.log("Single SUCCESS");
  } catch (e) {
    console.error("FAILED:", e.message);
  }
}
test();
