"use client";

import { useState } from "react";
import { Sparkles, Loader2, Copy, Check, Brain, ListOrdered, PenTool, Send } from "lucide-react";
import { getAuthHeaders } from "@/lib/client-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";

export default function ExtrasPage() {
  const [activeTool, setActiveTool] = useState<"quiz" | "vocab" | "activity" | null>(null);
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState("10");
  const [subType, setSubType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTool || !topic) return;

    setIsLoading(true);
    setOutput(null);

    try {
      const response = await fetch("/api/extras", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ type: activeTool, topic, count, subType }),
      });

      if (!response.ok) throw new Error("Failed to generate content");

      const data = await response.json();
      setOutput(data.output);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-purple-500" />
          The Educator&apos;s Playground
        </h1>
        <p className="text-slate-500">Quick tools to generate supplemental materials on the fly.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <ToolCard 
          title="Quiz Generator" 
          description="Create MCQs, True/False, or Short Answer quizzes." 
          icon={<Brain className="w-6 h-6 text-orange-500" />}
          isActive={activeTool === "quiz"}
          onClick={() => { setActiveTool("quiz"); setSubType("Multiple Choice"); setCount("5"); setOutput(null); }}
        />
        <ToolCard 
          title="Vocab Master" 
          description="Generate word lists of up to 21 words with definitions." 
          icon={<ListOrdered className="w-6 h-6 text-blue-500" />}
          isActive={activeTool === "vocab"}
          onClick={() => { setActiveTool("vocab"); setSubType(""); setCount("10"); setOutput(null); }}
        />
        <ToolCard 
          title="Activity Lab" 
          description="Create group, individual, or interactive activities." 
          icon={<PenTool className="w-6 h-6 text-emerald-500" />}
          isActive={activeTool === "activity"}
          onClick={() => { setActiveTool("activity"); setSubType("Group Project"); setCount(""); setOutput(null); }}
        />
      </div>

      <AnimatePresence>
        {activeTool && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-8"
          >
            <Card className="p-6 border-slate-200/60 bg-white shadow-sm">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-1 space-y-2">
                  <label className="text-sm font-medium text-slate-700">Topic</label>
                  <Input 
                    placeholder="e.g., Photosynthesis" 
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="bg-slate-50 border-slate-200"
                  />
                </div>

                {activeTool === "quiz" && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Test Type</label>
                      <Select onValueChange={setSubType} value={subType}>
                        <SelectTrigger className="bg-slate-50 border-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Multiple Choice">Multiple Choice</SelectItem>
                          <SelectItem value="True/False">True/False</SelectItem>
                          <SelectItem value="Short Answer">Short Answer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Questions</label>
                      <Select onValueChange={setCount} value={count}>
                        <SelectTrigger className="bg-slate-50 border-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 Questions</SelectItem>
                          <SelectItem value="10">10 Questions</SelectItem>
                          <SelectItem value="15">15 Questions</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {activeTool === "vocab" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Word Count (Max 21)</label>
                    <Input 
                      type="number" 
                      min="1" 
                      max="21" 
                      value={count}
                      onChange={(e) => setCount(e.target.value)}
                      className="bg-slate-50 border-slate-200"
                    />
                  </div>
                )}

                {activeTool === "activity" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Activity Type</label>
                    <Select onValueChange={setSubType} value={subType}>
                      <SelectTrigger className="bg-slate-50 border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Group Project">Group Project</SelectItem>
                        <SelectItem value="Individual Task">Individual Task</SelectItem>
                        <SelectItem value="Hands-on Lab">Hands-on Lab</SelectItem>
                        <SelectItem value="Discussion Prompt">Discussion Prompt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={isLoading || !topic}
                  className="bg-purple-600 hover:bg-purple-700 text-white h-10 w-full md:col-start-4"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                  Generate
                </Button>
              </form>
            </Card>

            {output && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={copyToClipboard} className="gap-2">
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied" : "Copy to LMS"}
                  </Button>
                </div>
                <Card className="p-8 bg-white border-slate-200 shadow-sm min-h-[400px]">
                  <div className="prose prose-slate max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {output}
                    </ReactMarkdown>
                  </div>
                </Card>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ToolCard({ title, description, icon, isActive, onClick }: { title: string, description: string, icon: React.ReactNode, isActive: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`text-left p-6 rounded-2xl border transition-all duration-300 ${
        isActive 
          ? "border-purple-500 bg-purple-50/50 shadow-md ring-1 ring-purple-500" 
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
      }`}
    >
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500">{description}</p>
    </button>
  );
}
