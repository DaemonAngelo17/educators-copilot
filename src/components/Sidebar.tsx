"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BookOpen, 
  Search, 
  Lightbulb, 
  ScrollText, 
  Sparkles,
  Settings,
  Database,
  Cpu,
  CheckCircle2,
  XCircle,
  Trash2,
  X
} from "lucide-react";
import { useEffect, useState } from "react";

const navigation = [
  { name: "Upload", href: "/", icon: BookOpen, color: "text-slate-500", bgColor: "bg-slate-100" },
  { name: "Search", href: "/search", icon: Search, color: "text-emerald-500", bgColor: "bg-emerald-100" },
  { name: "Notebook", href: "/notebook", icon: BookOpen, color: "text-indigo-500", bgColor: "bg-indigo-100" },
  { name: "Implications", href: "/implications", icon: Lightbulb, color: "text-blue-500", bgColor: "bg-blue-100" },
  { name: "Lesson Plans", href: "/lesson-plans", icon: ScrollText, color: "text-orange-500", bgColor: "bg-orange-100" },
  { name: "Extras", href: "/extras", icon: Sparkles, color: "text-purple-500", bgColor: "bg-purple-100" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [hasDoc, setHasDoc] = useState(false);
  const [provider, setProvider] = useState<string>("none");
  const [chunkCount, setChunkCount] = useState(0);
  const [documents, setDocuments] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const removeDocument = async (fileName: string) => {
    setIsDeleting(fileName);
    try {
      const res = await fetch(`/api/knowledge?fileName=${encodeURIComponent(fileName)}`, { method: "DELETE" });
      if (res.ok) {
        setDocuments(prev => prev.filter(d => d !== fileName));
      }
    } catch (e) {
      console.error("Failed to remove document", e);
    } finally {
      setIsDeleting(null);
    }
  };

  const clearAll = async () => {
    if (!confirm("Are you sure you want to clear ALL uploaded knowledge?")) return;
    setIsDeleting("all");
    try {
      const res = await fetch("/api/knowledge", { method: "DELETE" });
      if (res.ok) {
        setDocuments([]);
        setHasDoc(false);
        setChunkCount(0);
      }
    } catch (e) {
      console.error("Failed to clear knowledge", e);
    } finally {
      setIsDeleting(null);
    }
  };

  useEffect(() => {
    // Check local storage for provider
    const checkStatus = async () => {
      const savedProvider = localStorage.getItem("preferred_provider");
      const providerKey = localStorage.getItem(`${savedProvider}_api_key`);
      
      if (savedProvider && providerKey) {
        setProvider(savedProvider);
      } else {
        setProvider("none");
      }

      // Check vector store
      try {
        const res = await fetch("/api/status", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setHasDoc(data.hasDocument);
          setChunkCount(data.chunkCount);
          setDocuments(data.documents || []);
        }
      } catch (e) {
        console.error("Failed to fetch status", e);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000); // poll every 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full w-64 bg-slate-50 border-r border-slate-200">
      <div className="p-6">
        <h1 className="text-xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          Educator Copilot
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">AI Assistant for Teachers</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 ${
                isActive 
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/60" 
                  : "text-slate-600 hover:bg-slate-100/50 hover:text-slate-900"
              }`}
            >
              <div className={`p-1.5 rounded-md ${isActive ? item.bgColor : "bg-transparent"} transition-colors`}>
                <item.icon className={`w-4 h-4 ${isActive ? item.color : "text-slate-500"}`} />
              </div>
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 space-y-4">
        
        {/* System Status Panel */}
        <div className="px-3 py-3 bg-slate-100 rounded-xl border border-slate-200/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-600 text-xs font-semibold uppercase tracking-wider">
              <Database className="w-3.5 h-3.5" />
              Knowledge
            </div>
            {hasDoc ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {chunkCount} chunks
                </div>
                <button 
                  onClick={clearAll}
                  disabled={isDeleting !== null}
                  className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  title="Clear All Knowledge"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">
                <XCircle className="w-3.5 h-3.5" /> empty
              </div>
            )}
          </div>
          
          {hasDoc && documents.length > 0 && (
            <div className="space-y-1.5 pt-1 border-t border-slate-200/60 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
              {documents.map((doc, i) => (
                <div key={i} className="group text-[10px] font-medium text-slate-500 bg-white border border-slate-200 rounded px-2 py-1 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 truncate">
                    <BookOpen className="w-3 h-3 text-indigo-400 shrink-0" />
                    <span className="truncate">{doc}</span>
                  </div>
                  <button
                    onClick={() => removeDocument(doc)}
                    disabled={isDeleting !== null}
                    className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
            <div className="flex items-center gap-2 text-slate-600 text-xs font-semibold uppercase tracking-wider">
              <Cpu className="w-3.5 h-3.5" />
              AI Core
            </div>
            {provider !== "none" ? (
              <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full capitalize">
                <CheckCircle2 className="w-3 h-3" /> {provider}
              </div>
            ) : (
              <div className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                <XCircle className="w-3 h-3" /> missing key
              </div>
            )}
          </div>
        </div>

        <Link 
          href="/settings"
          className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-lg transition-colors ${
            pathname === "/settings" 
              ? "bg-white text-slate-900 shadow-sm border border-slate-200/60" 
              : "text-slate-600 hover:bg-slate-100/50 hover:text-slate-900"
          }`}
        >
          <Settings className={`w-4 h-4 ${pathname === "/settings" ? "text-indigo-600" : "text-slate-500"}`} />
          <span className="font-medium text-sm">Settings</span>
        </Link>
      </div>
    </div>
  );
}
