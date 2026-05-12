import { NextRequest, NextResponse } from "next/server";
import { getVectorStore } from "@/lib/vectorstore";

export const dynamic = "force-dynamic";

// Access the global singleton
const globalForVectorStore = globalThis as unknown as {
  vectorStore: any;
  currentApiKey: string | null;
};

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fileName = searchParams.get("fileName");

    if (fileName) {
      // Remove specific document
      const store = await getVectorStore();
      if (store && (store as any).memoryVectors) {
        const initialCount = (store as any).memoryVectors.length;
        (store as any).memoryVectors = (store as any).memoryVectors.filter(
          (v: any) => v.metadata?.source !== fileName
        );
        const finalCount = (store as any).memoryVectors.length;
        
        return NextResponse.json({ 
          success: true, 
          message: `Removed ${fileName}`,
          removedChunks: initialCount - finalCount
        });
      }
    } else {
      // Clear entire store
      globalForVectorStore.vectorStore = null;
      globalForVectorStore.currentApiKey = null;
      return NextResponse.json({ success: true, message: "All knowledge cleared" });
    }
    
    return NextResponse.json({ success: false, error: "No document found to remove" }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to remove knowledge" }, { status: 500 });
  }
}
