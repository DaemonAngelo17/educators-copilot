"use client";

import { useState, useEffect } from "react";
import { Lightbulb, ChevronRight, RefreshCw, Beaker, Users, Sparkles } from "lucide-react";
import { getAuthHeaders } from "@/lib/client-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AIProgress } from "@/components/AIProgress";
import { motion, AnimatePresence } from "framer-motion";

interface Implication {
  topic: string;
  connection: string;
  relevance: string;
}

interface ImplicationsData {
  science: Implication[];
  socialScience: Implication[];
}

export default function ImplicationsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<ImplicationsData | null>(null);

  const fetchImplications = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/implications", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({}),
      });
      if (!response.ok) throw new Error("Failed to fetch implications");
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchImplications();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-8 min-h-full flex flex-col">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <Lightbulb className="w-8 h-8 text-blue-500" />
            Curriculum Implications
          </h1>
          <p className="text-slate-500">Connecting course material to broader scientific and social science frameworks.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={fetchImplications} 
          disabled={isLoading}
          className="gap-2 border-slate-200 text-slate-600"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Analysis
        </Button>
      </div>

      {isLoading && !data ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[32px]">
          <div className="w-full max-w-md">
            <AIProgress isLoading={isLoading} label="Mapping interdisciplinary connections..." />
            <div className="text-center mt-6">
              <p className="text-lg font-bold text-slate-900 tracking-tight">AI Reasoning in Progress</p>
              <p className="text-sm text-slate-500 font-medium">Connecting curriculum themes to real-world science & social frameworks.</p>
            </div>
          </div>
        </div>
      ) : data ? (
        <Tabs defaultValue="science" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mb-8 bg-slate-100 p-1 rounded-xl h-12">
            <TabsTrigger value="science" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm gap-2">
              <Beaker className="w-4 h-4" />
              Scientific
            </TabsTrigger>
            <TabsTrigger value="socialScience" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm gap-2">
              <Users className="w-4 h-4" />
              Social Science
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="science" className="mt-0">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {data.science.map((item, idx) => (
                  <ImplicationCard key={idx} item={item} color="blue" />
                ))}
              </motion.div>
            </TabsContent>

            <TabsContent value="socialScience" className="mt-0">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {data.socialScience.map((item, idx) => (
                  <ImplicationCard key={idx} item={item} color="indigo" />
                ))}
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
          <Lightbulb className="w-12 h-12 mb-4 opacity-20" />
          <p>Please upload a document to generate implications</p>
        </div>
      )}
    </div>
  );
}

function ImplicationCard({ item, color }: { item: Implication, color: 'blue' | 'indigo' }) {
  const colorClasses = color === 'blue' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600';
  const borderClasses = color === 'blue' ? 'border-blue-200 hover:border-blue-300' : 'border-indigo-200 hover:border-indigo-300';
  
  return (
    <Card className={`p-6 border shadow-sm transition-all duration-300 group ${borderClasses} bg-white flex flex-col h-full`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${colorClasses}`}>
          {item.topic}
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-400 transition-colors" />
      </div>
      
      <div className="space-y-4 flex-1">
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-tight mb-1">Direct Connection</h4>
          <p className="text-slate-700 leading-relaxed">{item.connection}</p>
        </div>
        
        <div className="pt-4 border-t border-slate-50">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-tight mb-1">Real-world Relevance</h4>
          <p className="text-slate-600 text-sm italic">&quot;{item.relevance}&quot;</p>
        </div>
      </div>
    </Card>
  );
}
