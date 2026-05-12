import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

async function test() {
  try {
    const embed = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      model: "text-embedding-004"
    });
    const res = await embed.embedQuery("hello world");
    console.log("SUCCESS length:", res.length);
  } catch (e) {
    console.error(e.message);
  }
}
test();
