import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { OpenAIEmbeddings } from "@langchain/openai";
import { USEEmbeddings } from "./use-embeddings";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";


// Singleton instance for the vector store
const globalForVectorStore = globalThis as unknown as {
  vectorStore: MemoryVectorStore | null;
  currentApiKey: string | null;
};

export async function getVectorStore(apiKey?: string, provider: string = "gemini") {
  // 1. Getter check: If no API key is provided and we already have a store, just return it.
  if (!apiKey && globalForVectorStore.vectorStore) {
    return globalForVectorStore.vectorStore;
  }

  // 2. Resolve final key, avoiding the placeholder in .env.local
  const envKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || "";
  const isPlaceholder = envKey.includes("your_api_key") || envKey === "" || envKey === "default";
  const finalKey = apiKey || (isPlaceholder ? null : envKey);
  
  if (!finalKey) {
    throw new Error("API key is missing. Please enter your API key in the Settings page.");
  }

  // Force recreate if it's the old Google embeddings still lingering in memory
  const isOldGemini = globalForVectorStore.vectorStore && 
                      (globalForVectorStore.vectorStore.embeddings as any)?.modelName;

  if (!globalForVectorStore.vectorStore || globalForVectorStore.currentApiKey !== finalKey || isOldGemini) {
    let embeddings;
    
    if (provider === "openai") {
      embeddings = new OpenAIEmbeddings({ openAIApiKey: finalKey });
    } else {
      // Use local TFJS Universal Sentence Encoder!
      // This completely bypasses any API key restrictions or 404 errors for Gemini/Anthropic users.
      console.log("Using Local Universal Sentence Encoder for embeddings");
      embeddings = new USEEmbeddings();
    }

    globalForVectorStore.vectorStore = new MemoryVectorStore(embeddings);
    globalForVectorStore.currentApiKey = finalKey;
  }
  return globalForVectorStore.vectorStore;
}

export async function processAndStoreDocument(
  text: string, 
  fileName: string, 
  apiKey?: string, 
  provider: string = "gemini",
  onProgress?: (progress: number, message: string) => void
) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const docs = await splitter.createDocuments([text], [{ source: fileName }]);
  
  const store = await getVectorStore(apiKey, provider);

  // If using local USE, hook up the progress listener
  if (store.embeddings instanceof USEEmbeddings && onProgress) {
    store.embeddings.onProgress = onProgress;
  }

  // Validate the embedding model actually works before saving
  try {
    const testEmbed = await store.embeddings.embedQuery("test");
    if (!testEmbed || testEmbed.length === 0) {
      throw new Error("Embedding model returned empty vector");
    }
  } catch (e: any) {
    throw new Error(`Embedding validation failed: ${e.message}`);
  }

  await store.addDocuments(docs);
  
  return docs.length; // Return number of chunks for the UI
}

export async function searchVectorStore(query: string, k: number = 5, apiKey?: string, provider: string = "gemini") {
  const store = await getVectorStore(apiKey, provider);
  try {
    const results = await store.similaritySearch(query, k);
    return results;
  } catch (e: any) {
    throw e;
  }
}
