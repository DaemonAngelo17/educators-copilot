import { NextRequest, NextResponse } from "next/server";
import { processAndStoreDocument } from "@/lib/vectorstore";
import pdfParse from "pdf-parse";
import { getApiKeyFromHeaders, getProviderFromHeaders } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      const sendUpdate = (progress: number, message: string) => {
        controller.enqueue(encoder.encode(JSON.stringify({ progress, message }) + "\n"));
      };

      try {
        const provider = getProviderFromHeaders(req);
        const embedProvider = provider === "anthropic" ? "gemini" : provider;
        const apiKey = provider === "anthropic" ? 
          req.headers.get("x-gemini-key") || process.env.GOOGLE_GENERATIVE_AI_API_KEY : 
          getApiKeyFromHeaders(req, provider);

        const formData = await req.formData();
        const file = formData.get("file") as File;
        
        if (!file) {
          sendUpdate(0, "Error: No file provided");
          controller.close();
          return;
        }

        const extension = file.name.split('.').pop()?.toLowerCase();
        let text = "";

        sendUpdate(5, "Extracting text from document...");
        if (extension === "txt") {
          text = await file.text();
        } else if (extension === "pdf") {
          const buffer = Buffer.from(await file.arrayBuffer());
          const data = await pdfParse(buffer);
          text = data.text;
        } else if (extension === "epub") {
          sendUpdate(0, "Error: EPUB support is coming soon.");
          controller.close();
          return;
        }

        if (!text || text.trim().length === 0) {
          sendUpdate(0, "Error: Failed to extract text.");
          controller.close();
          return;
        }

        sendUpdate(10, "Initializing AI Core...");
        
        const chunkCount = await processAndStoreDocument(
          text, 
          file.name, 
          apiKey as string, 
          embedProvider,
          (progress, message) => {
            // Mapping embedding progress (0-100) to total progress (10-100)
            const totalProgress = 10 + (progress * 0.9);
            sendUpdate(totalProgress, message);
          }
        );

        sendUpdate(100, `Success: Processed ${file.name} into ${chunkCount} chunks.`);
        controller.close();
      } catch (error: any) {
        console.error("Upload error:", error);
        sendUpdate(0, `Error: ${error.message}`);
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
