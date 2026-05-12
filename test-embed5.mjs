import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

const embed = new GoogleGenerativeAIEmbeddings({
  apiKey: key,
  model: "text-embedding-004",
});

try {
  console.log("Testing embedDocuments with 1 item...");
  const res = await embed.embedDocuments(["test document"]);
  console.log("Docs result:", res.length, res[0].length);
} catch(e) {
  console.log("DOCS FAILED:", e.message);
}

try {
  console.log("Testing embedQuery...");
  const res = await embed.embedQuery("test query");
  console.log("Query result:", res.length);
} catch(e) {
  console.log("QUERY FAILED:", e.message);
}
