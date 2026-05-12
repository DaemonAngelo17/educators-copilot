"use client";

import { useState, useRef } from "react";
import { ScrollText, Loader2, Download, GraduationCap, BookOpen, Copy, Check, Send } from "lucide-react";
import { getAuthHeaders } from "@/lib/client-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { AIProgress } from "@/components/AIProgress";
import { motion, AnimatePresence } from "framer-motion";

export default function LessonPlansPage() {
  const [gradeLevel, setGradeLevel] = useState("");
  const [topic, setTopic] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const planRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradeLevel || !topic) return;

    setIsLoading(true);
    setPlan(null);

    try {
      const response = await fetch("/api/lesson-plan", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ gradeLevel, topic }),
      });

      if (!response.ok) throw new Error("Failed to generate lesson plan");

      const data = await response.json();
      setPlan(data.plan);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (plan) {
      navigator.clipboard.writeText(plan);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadPDF = async () => {
    if (!planRef.current) return;

    const element = planRef.current;
    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true
    });
    
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Lesson_Plan_${topic.replace(/\s+/g, "_")}.pdf`);
  };

  return (
    <div className="max-w-5xl mx-auto p-8 h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
          <ScrollText className="w-8 h-8 text-orange-500" />
          Lesson Plan Generator
        </h1>
        <p className="text-slate-500">Generate structured, standards-aligned lesson plans from your source material.</p>
      </div>

      <Card className="p-6 border-slate-200/60 bg-white shadow-sm mb-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-slate-400" />
              Grade Level
            </label>
            <Select onValueChange={(v) => v && setGradeLevel(v)} value={gradeLevel}>
              <SelectTrigger className="bg-slate-50 border-slate-200">
                <SelectValue placeholder="Select Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Elementary (K-5)">Elementary (K-5)</SelectItem>
                <SelectItem value="Middle School (6-8)">Middle School (6-8)</SelectItem>
                <SelectItem value="High School (9-12)">High School (9-12)</SelectItem>
                <SelectItem value="University / Higher Ed">University / Higher Ed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-1">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-slate-400" />
              Focus Topic
            </label>
            <Input 
              placeholder="e.g., Cellular Respiration" 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="bg-slate-50 border-slate-200"
            />
          </div>

          <Button 
            type="submit" 
            disabled={isLoading || !gradeLevel || !topic}
            className="bg-orange-600 hover:bg-orange-700 text-white h-10 w-full"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
            Generate Plan
          </Button>
        </form>
      </Card>

      <AnimatePresence mode="wait">
        {plan ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col space-y-4"
          >
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={copyToClipboard} className="gap-2">
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button variant="outline" size="sm" onClick={downloadPDF} className="gap-2">
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
            </div>

            <Card className="flex-1 bg-white border-slate-200 shadow-lg overflow-hidden">
              <div 
                ref={planRef} 
                className="p-12 prose prose-slate max-w-none prose-headings:text-slate-900 prose-h1:text-4xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-slate-700 prose-li:text-slate-700 prose-strong:text-slate-900"
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {plan}
                </ReactMarkdown>
              </div>
            </Card>
          </motion.div>
        ) : isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[32px]">
            <div className="w-full max-w-md">
              <AIProgress isLoading={isLoading} label="Drafting structured lesson plan..." />
              <div className="text-center mt-6">
                <p className="text-lg font-bold text-slate-900 tracking-tight">AI Authoring in Progress</p>
                <p className="text-sm text-slate-500 font-medium">Synthesizing standards-aligned activities and assessment strategies.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
            <ScrollText className="w-12 h-12 mb-4 opacity-20" />
            <p>Select a grade and topic to generate a lesson plan</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
