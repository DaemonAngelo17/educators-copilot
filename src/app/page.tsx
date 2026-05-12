import { FileUpload } from "@/components/FileUpload";
import { Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col h-full items-center justify-center p-8">
      <div className="max-w-3xl w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-2xl mb-4">
            <Sparkles className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Welcome to Educator Copilot
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Upload your course materials to instantly generate lesson plans, analyze implications, and search through content using AI.
          </p>
        </div>
        
        <FileUpload />
      </div>
    </div>
  );
}

