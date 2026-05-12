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
    const { type, topic, count, subType } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: `API key for ${provider} is missing.` }, { status: 401 });
    }

    const relevantDocs = await searchVectorStore(topic, 10, embedKey ?? undefined, embedProvider);
    const context = relevantDocs.map(doc => doc.pageContent).join("\n\n---\n\n");

    const model = getLLM({
      provider,
      apiKey,
      temperature: 0.7,
    });

    let promptTemplate = "";

    if (type === "quiz") {
      promptTemplate = `
        Create a {count} question {subType} quiz about {topic} based on the following text:
        {context}
        Include an answer key at the end.
      `;
    } else if (type === "vocab") {
      promptTemplate = `
        Extract {count} key vocabulary words about {topic} from this text:
        {context}
        For each word, provide a definition and an example sentence.
      `;
    } else {
      promptTemplate = `
        Create a student activity guide for {topic} called "{subType}".
        Use the following text context:
        {context}
        Make it hands-on, engaging, and suitable for classroom use.
      `;
    }

    const prompt = PromptTemplate.fromTemplate(promptTemplate);
    const chain = prompt.pipe(model).pipe(new StringOutputParser());
    
    const output = await chain.invoke({
      context,
      topic,
      count,
      subType,
    });

    return NextResponse.json({ output });
  } catch (error: unknown) {
    console.error("Extras error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
