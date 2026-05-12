"use client";

import { useState } from "react";
import { Search, Book, Sparkles, Send, Loader2 } from "lucide-react";
import { AIProgress } from "@/components/AIProgress";
import { getAuthHeaders } from "@/lib/client-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

interface Source {
  content: string;
  source: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [sources, setSources] = useState<Source[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setResult(null);
    setSources([]);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Search failed");
      }

      const data = await response.json();
      setResult(data.answer);
      setSources(data.sources);
    } catch (error: any) {
      console.error("Search error:", error);
      setResult(error.message || "An error occurred while searching. Please make sure you have uploaded a document and set your API key.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
          <Search className="w-8 h-8 text-emerald-500" />
          Search the Book
        </h1>
        <p className="text-slate-500">Ask any question about your uploaded document and get AI-powered answers based on the text.</p>
      </div>

      <form onSubmit={handleSearch} className="relative mb-8">
        <Input
          placeholder="Ask a question about the book..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-14 pl-12 pr-32 bg-white border-slate-200 shadow-sm focus:ring-emerald-500 rounded-xl text-lg"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Button 
          type="submit" 
          disabled={isLoading || !query.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-10"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
          Ask AI
        </Button>
      </form>

      <AIProgress isLoading={isLoading} label="Analyzing document context..." />

      <ScrollArea className="flex-1 -mx-4 px-4">
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 pb-8"
            >
              <Card className="p-8 border-slate-200/60 bg-white shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                <div className="flex items-center gap-2 mb-4 text-emerald-600 font-semibold text-sm uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  AI Answer
                </div>
                <div className="prose prose-slate max-w-none text-slate-800 leading-relaxed text-lg">
                  {result}
                </div>
              </Card>

              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Book className="w-4 h-4" />
                  Sources & Excerpts
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sources.map((source, idx) => (
                    <Card key={idx} className="p-4 bg-slate-50 border-slate-200/60 hover:bg-white transition-colors cursor-default">
                      <p className="text-sm text-slate-600 italic line-clamp-3 mb-2">&quot;{source.content}&quot;</p>
                      <div className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">Source: {source.source}</div>
                    </Card>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : !isLoading && (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <Search className="w-12 h-12 mb-4 opacity-20" />
              <p>Type a question above to start searching</p>
            </div>
          )}
        </AnimatePresence>
      </ScrollArea>
    </div>
  );
}
