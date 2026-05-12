import { NextRequest, NextResponse } from "next/server";
import { searchVectorStore } from "@/lib/vectorstore";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { getApiKeyFromHeaders, getProviderFromHeaders } from "@/lib/auth";
import { getLLM } from "@/lib/llm";

export async function POST(req: NextRequest) {
  try {
    const provider = getProviderFromHeaders(req);
    const apiKey = getApiKeyFromHeaders(req, provider);
    const embedProvider = provider === "anthropic" ? "gemini" : provider;
    const embedKey = provider === "anthropic" ? (req.headers.get("x-gemini-key") || undefined) : apiKey;
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: `API key for ${provider} is missing. Please set it in Settings.` }, { status: 401 });
    }

    // 1. Retrieve relevant chunks (Always using Gemini embeddings for now as vector store is initialized with it)
    // Note: In a production app, you might want to use embeddings from the chosen provider too.
    const relevantDocs = await searchVectorStore(query, 5, embedKey ?? undefined, embedProvider);
    
    if (!relevantDocs || relevantDocs.length === 0) {
      return NextResponse.json({ 
        answer: "I couldn't find any relevant information in the uploaded document to answer your question.",
        sources: []
      });
    }

    const context = relevantDocs.map(doc => doc.pageContent).join("\n\n---\n\n");

    // 2. Initialize requested LLM
    const model = getLLM({
      provider,
      apiKey,
      temperature: 0.2,
    });

    const prompt = PromptTemplate.fromTemplate(`
      You are an expert educational assistant. Use the following context from a textbook or document to answer the user's question.
      If the answer is not in the context, say you don't know, but try to be as helpful as possible with what is provided.
      
      Context:
      {context}
      
      Question: {query}
      
      Answer (be concise, accurate, and pedagogical):
    `);

    const chain = prompt.pipe(model).pipe(new StringOutputParser());
    const answer = await chain.invoke({
      context,
      query,
    });

    return NextResponse.json({
      answer,
      sources: relevantDocs.map(doc => ({
        content: doc.pageContent,
        source: doc.metadata.source,
      })),
    });
  } catch (error: unknown) {
    console.error("Search error:", error);
    
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
      if (errorMessage.includes("404") || errorMessage.includes("not found")) {
        errorMessage = "Your API key does not have access to the embedding model. Please check your Google Cloud billing or use an OpenAI key instead.";
      }
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
