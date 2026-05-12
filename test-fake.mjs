import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

async function test() {
  const embed = new GoogleGenerativeAIEmbeddings({
    apiKey: "AIzaSyFakeKeyFakeKeyFakeKey",
    model: "embedding-001",
  });
  console.log("Testing fallback...");
  try {
    await embed.embedQuery("test");
  } catch(e) {
    console.log("Error:", e.message);
  }
}
test();
