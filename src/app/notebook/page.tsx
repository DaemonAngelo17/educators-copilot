"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { AIProgress } from "@/components/AIProgress";
import { getAuthHeaders } from "@/lib/client-auth";
import { 
  BookOpen, 
  Target, 
  HelpCircle, 
  Sparkles,
  ChevronRight,
  MessageSquare
} from "lucide-react";
import { motion } from "framer-motion";

interface NotebookData {
  summary: string;
  keyConcepts: string[];
  targetAudience: string;
  suggestedQuestions: string[];
}

export default function NotebookPage() {
  const [data, setData] = useState<NotebookData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOverview() {
      try {
        const response = await fetch("/api/notebook/overview", {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({}),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => null);
          throw new Error(errData?.error || "Failed to generate document overview");
        }

        const result = await response.json();
        setData(result);
      } catch (err: any) {
        console.error("Overview error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchOverview();
  }, []);

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-slate-50/50 p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-indigo-600" />
              Notebook Overview
            </h1>
            <p className="text-slate-500 text-lg">AI-generated DNA of your document knowledge base.</p>
          </header>

          {loading ? (
            <div className="mt-20">
              <AIProgress 
                isLoading={true}
                label="Analyzing document structure and extracting key concepts..." 
              />
            </div>
          ) : error ? (
            <Card className="p-12 text-center border-dashed border-red-200 bg-red-50/30">
              <div className="max-w-md mx-auto space-y-4">
                <div className="bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-red-600">
                  <XCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Analysis Failed</h3>
                <p className="text-slate-500">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50"
                >
                  Try Again
                </button>
              </div>
            </Card>
          ) : data ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Main Summary */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="md:col-span-2"
              >
                <Card className="p-8 border-slate-200/60 shadow-sm overflow-hidden relative group">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Sparkles className="w-24 h-24 text-indigo-600" />
                  </div>
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm uppercase tracking-wider">
                      <MessageSquare className="w-4 h-4" />
                      Executive Summary
                    </div>
                    <p className="text-slate-700 text-xl leading-relaxed font-medium">
                      {data.summary}
                    </p>
                  </div>
                </Card>
              </motion.div>

              {/* Key Concepts */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="p-6 h-full border-slate-200/60 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm uppercase tracking-wider">
                    <Target className="w-4 h-4" />
                    Key Concepts
                  </div>
                  <div className="space-y-3">
                    {data.keyConcepts.map((concept, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 group hover:border-emerald-200 transition-colors">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                          {i + 1}
                        </div>
                        <span className="text-slate-700 font-medium">{concept}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>

              {/* Suggested Questions */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-6 h-full border-slate-200/60 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-wider">
                    <HelpCircle className="w-4 h-4" />
                    Suggested Questions
                  </div>
                  <div className="space-y-3">
                    {data.suggestedQuestions.map((q, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100 hover:border-blue-200 transition-colors cursor-pointer group">
                        <ChevronRight className="w-4 h-4 text-blue-400 mt-1 shrink-0 group-hover:translate-x-1 transition-transform" />
                        <span className="text-slate-700 font-medium italic">"{q}"</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-slate-100">
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <Target className="w-3 h-3" />
                      Target Audience: <span className="font-semibold text-slate-600">{data.targetAudience}</span>
                    </div>
                  </div>
                </Card>
              </motion.div>

            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}

function XCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  )
}
