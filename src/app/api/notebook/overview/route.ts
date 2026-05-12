import { NextRequest, NextResponse } from "next/server";
import { searchVectorStore } from "@/lib/vectorstore";
import { getApiKeyFromHeaders, getProviderFromHeaders } from "@/lib/auth";
import { getLLM } from "@/lib/llm";

export async function POST(req: NextRequest) {
  try {
    const provider = getProviderFromHeaders(req);
    const apiKey = getApiKeyFromHeaders(req, provider);
    
    if (!apiKey) {
      return NextResponse.json({ error: "API key is missing" }, { status: 401 });
    }

    // 1. Get a broad sample of the document for overview
    // We'll search for "summary" or just get the first few chunks
    const relevantDocs = await searchVectorStore("overview and main concepts", 10, apiKey, provider);
    
    if (!relevantDocs || relevantDocs.length === 0) {
      return NextResponse.json({ error: "No document knowledge found. Please upload a document first." }, { status: 404 });
    }

    const context = relevantDocs.map(doc => doc.pageContent).join("\n\n---\n\n");

    // 2. Initialize LLM
    const model = getLLM({
      provider,
      apiKey,
      temperature: 0.3,
    });

    const prompt = `
      You are a specialized document analyst (like NotebookLM). Based on the following excerpts from a document, provide a comprehensive overview.
      
      Your response must be in JSON format with the following keys:
      1. "summary": A 3-sentence high-level summary of the entire document.
      2. "keyConcepts": An array of 5 key concepts or themes found in the text.
      3. "targetAudience": Who this document is intended for.
      4. "suggestedQuestions": 3 insightful questions a student might ask about this text.

      Excerpts:
      ${context}

      JSON Response:
    `;

    // Since our mock LLM returns a string, we'll try to parse it
    const responseText = await model.invoke(prompt);
    
    // Extract JSON if AI wrapped it in markdown
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Notebook Overview error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
