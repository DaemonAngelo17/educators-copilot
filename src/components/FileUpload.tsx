"use client";

import { useState, useCallback } from "react";
import { Upload, File, CheckCircle, AlertCircle, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { getAuthHeaders } from "@/lib/client-auth";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export function FileUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processProgress, setProcessProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const router = useRouter();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = async (selectedFile: File) => {
    if (!selectedFile.name.match(/\.(pdf|txt|epub)$/i)) {
      alert("Please upload a PDF, TXT, or EPUB file.");
      return;
    }
    
    setFile(selectedFile);
    setStatus("uploading");
    setStatusMessage("Uploading document to secure memory...");
    setUploadProgress(10);
    setProcessProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      // Phase 1: Upload (Simulated until fetch starts)
      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => (prev >= 90 ? 90 : prev + 5));
      }, 100);

      const headers = getAuthHeaders();
      delete headers["Content-Type"];

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        headers: headers,
      });

      clearInterval(uploadInterval);
      setUploadProgress(100);

      if (!response.ok) throw new Error("Connection failed");

      // Phase 2: Processing (Real-time Stream)
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("Failed to read stream");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter(Boolean);

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.progress !== undefined) {
              setStatus("processing");
              // totalProgress in API is 10-100. We map it back or just use it.
              // Let's use it for the second bar logic.
              // Actually, API sends 10-100 as "totalProgress".
              // Let's just update the status message and process bar.
              const p = Math.max(0, (data.progress - 10) / 0.9);
              setProcessProgress(p);
              setStatusMessage(data.message);

              if (data.message.toLowerCase().includes("error")) {
                setStatus("error");
              }
            }
          } catch (e) {
            console.error("JSON parse error:", e);
          }
        }
      }

      setStatus("success");
    } catch (error: unknown) {
      console.error("Upload failed:", error);
      setStatus("error");
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      setStatusMessage(`Error: ${errorMessage}`);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setStatus("idle");
    setUploadProgress(0);
    setProcessProgress(0);
  };

  return (
    <Card className="max-w-2xl w-full mx-auto p-10 shadow-2xl border-slate-200/60 bg-white/80 backdrop-blur-md rounded-[2.5rem]">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-4 bg-indigo-100 rounded-3xl mb-4 text-indigo-600 shadow-inner">
          <Upload className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Ingest Knowledge</h2>
        <p className="text-slate-500 text-lg">Upload textbook (PDF, TXT, EPUB) to activate the RAG engine.</p>
      </div>

      <AnimatePresence mode="wait">
        {status === "idle" ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-[2rem] p-16 text-center transition-all duration-300
              ${isDragging ? "border-indigo-500 bg-indigo-50 scale-[1.02]" : "border-slate-300 hover:border-slate-400 bg-slate-50/50"}
            `}
          >
            <input
              type="file"
              accept=".pdf,.txt,.epub"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileInput}
            />
            <div className="flex justify-center mb-6">
              <div className={`p-6 rounded-3xl ${isDragging ? "bg-white shadow-lg" : "bg-white shadow-sm"}`}>
                <File className={`w-10 h-10 ${isDragging ? "text-indigo-600" : "text-slate-400"}`} />
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Select a Document</h3>
            <p className="text-sm text-slate-500 font-medium">Or drag it right here to start</p>
          </motion.div>
        ) : (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border rounded-[2rem] p-8 bg-slate-50/50 border-slate-200"
          >
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-white rounded-2xl shadow-md border border-slate-100">
                  <File className="w-8 h-8 text-indigo-500" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 line-clamp-1">{file?.name}</h4>
                  <p className="text-sm text-slate-500 font-medium">{(file?.size ? (file.size / 1024 / 1024).toFixed(2) : 0)} MB</p>
                </div>
              </div>
              
              {status === "success" || status === "error" ? (
                <Button variant="ghost" size="icon" onClick={resetUpload} className="rounded-xl hover:bg-white transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </Button>
              ) : null}
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span>Phase 1: File Upload</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="h-1.5 rounded-full bg-slate-100" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span>Phase 2: AI Core Vectorization</span>
                  <span>{Math.round(processProgress)}%</span>
                </div>
                <Progress 
                  value={processProgress} 
                  className={`h-1.5 rounded-full bg-slate-100 ${status === 'uploading' ? 'opacity-20' : 'opacity-100'}`} 
                />
              </div>

              <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                {status === "success" && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                {status === "error" && <AlertCircle className="w-5 h-5 text-red-500" />}
                {(status === "uploading" || status === "processing") && <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />}
                <p className={`text-sm font-bold tracking-tight ${status === 'error' ? 'text-red-500' : 'text-slate-700'}`}>
                  {statusMessage}
                </p>
              </div>
            </div>

            {status === "success" && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-10 flex justify-end"
              >
                <Button 
                  onClick={() => router.push('/search')}
                  className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-8 h-12 font-bold shadow-lg shadow-slate-200 transition-all hover:translate-x-1"
                >
                  Explore Insights
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
