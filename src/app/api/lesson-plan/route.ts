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
    const { gradeLevel, topic } = await req.json();

    if (!gradeLevel || !topic) {
      return NextResponse.json({ error: "Grade level and topic are required" }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: `API key for ${provider} is missing.` }, { status: 401 });
    }

    const relevantDocs = await searchVectorStore(topic, 8, embedKey ?? undefined, embedProvider);
    const context = relevantDocs.map(doc => doc.pageContent).join("\n\n---\n\n");

    const model = getLLM({
      provider,
      apiKey,
      temperature: 0.7,
    });

    const prompt = PromptTemplate.fromTemplate(`
      You are an expert curriculum designer. Create a comprehensive lesson plan based on the provided text context.
      
      Topic: {topic}
      Grade Level: {gradeLevel}
      
      Text Context for reference:
      {context}
      
      Include the following sections in Markdown format:
      1. Lesson Title
      2. Learning Objectives (aligned with the context)
      3. Key Vocabulary (at least 5 terms from the text)
      4. Direct Instruction (Step-by-step guide for teachers)
      5. Student Activity (Hands-on and engaging)
      6. Assessment/Exit Ticket
      
      Format with clear headings and bullet points.
    `);

    const chain = prompt.pipe(model).pipe(new StringOutputParser());
    const lessonPlan = await chain.invoke({
      context,
      topic,
      gradeLevel,
    });

    return NextResponse.json({ lessonPlan });
  } catch (error: unknown) {
    console.error("Lesson plan error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
