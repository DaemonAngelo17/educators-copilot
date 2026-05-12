import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

async function test() {
  try {
    const embed = new GoogleGenerativeAIEmbeddings({
      apiKey: "AIzaSy_fake_key_12345",
      model: "embedding-001"
    });
    const res = await embed.embedQuery("hello world");
    console.log("SUCCESS length:", res.length);
  } catch (e) {
    console.error(e.message);
  }
}
test();
