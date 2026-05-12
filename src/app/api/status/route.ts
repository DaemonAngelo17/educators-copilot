import { NextResponse } from "next/server";
import { getVectorStore } from "@/lib/vectorstore";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const store = await getVectorStore();
    // memoryVectors is a property of MemoryVectorStore
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vectors = (store as any).memoryVectors || [];
    const chunkCount = vectors.length;
    
    // Extract unique filenames from metadata
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const documents = Array.from(new Set(vectors.map((v: any) => v.metadata?.source).filter(Boolean)));

    return NextResponse.json({ hasDocument: chunkCount > 0, chunkCount, documents });
  } catch (error) {
    return NextResponse.json({ hasDocument: false, chunkCount: 0, documents: [] });
  }
}
