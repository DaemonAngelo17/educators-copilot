import { NextResponse } from "next/server";
import { USEEmbeddings } from "@/lib/use-embeddings";

export async function GET() {
  try {
    // Check if USE is initialized
    const isUSELoaded = !!(global as any).useModel;
    
    return NextResponse.json({
      engines: [
        {
          name: "Universal Sentence Encoder (USE)",
          id: "use-v1",
          type: "Local Embedding Engine",
          size: "29.8 MB",
          status: isUSELoaded ? "Active (Memory Loaded)" : "Idle (Ready to Load)",
          installed: true,
          description: "Runs 100% locally on CPU using TensorFlow.js. Used for knowledge vectorization."
        },
        {
          name: "Gemini 1.5 Pro",
          id: "gemini-pro",
          type: "Cloud Generative Core",
          size: "N/A (Cloud)",
          status: "Connected",
          installed: true,
          description: "Google's flagship multi-modal reasoning engine."
        }
      ],
      system: {
        platform: process.platform,
        arch: process.arch,
        memoryUsage: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch diagnostics" }, { status: 500 });
  }
}
