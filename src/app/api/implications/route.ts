import { NextRequest, NextResponse } from "next/server";
import { searchVectorStore } from "@/lib/vectorstore";
import { PromptTemplate } from "@langchain/core/prompts";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { getApiKeyFromHeaders, getProviderFromHeaders } from "@/lib/auth";
import { getLLM } from "@/lib/llm";

export async function POST(req: NextRequest) {
  try {
    const provider = getProviderFromHeaders(req);
    const apiKey = getApiKeyFromHeaders(req, provider);
    const embedProvider = provider === "anthropic" ? "gemini" : provider;
    const embedKey = provider === "anthropic" ? (req.headers.get("x-gemini-key") || undefined) : apiKey;
    const { topic = "General themes and main concepts" } = await req.json();

    if (!apiKey) {
      return NextResponse.json({ error: `API key for ${provider} is missing.` }, { status: 401 });
    }

    const relevantDocs = await searchVectorStore(topic, 10, embedKey, embedProvider);
    const context = relevantDocs.map(doc => doc.pageContent).join("\n\n---\n\n");

    const model = getLLM({
      provider,
      apiKey,
      temperature: 0.3,
    });

    const prompt = PromptTemplate.fromTemplate(`
      You are an interdisciplinary education strategist. Analyze the provided text context and identify deep connections across two domains:
      1. Scientific & Technological Implications (How does this topic relate to science, math, or tech?)
      2. Social & Humanistic Implications (How does this relate to society, ethics, history, or culture?)

      Text Context:
      {context}

      Topic: {topic}

      Return a JSON object with exactly this structure:
      {{
        "scientific": [
          {{ "title": "string", "description": "string", "connection": "string" }}
        ],
        "social": [
          {{ "title": "string", "description": "string", "connection": "string" }}
        ]
      }}
      Provide at least 3 implications for each domain.
    `);

    const chain = prompt.pipe(model).pipe(new JsonOutputParser());
    const response = await chain.invoke({
      context,
      topic,
    });

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("Implications error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
