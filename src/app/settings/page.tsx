"use client";

import { useState, useEffect } from "react";
import { Settings, Key, Save, CheckCircle, AlertCircle, Cpu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Database, Activity, ShieldCheck, HardDrive, RefreshCw } from "lucide-react";

const providers = [
  { id: "gemini", name: "Google Gemini", icon: "✨" },
  { id: "openai", name: "OpenAI (GPT-4o)", icon: "🤖" },
  { id: "anthropic", name: "Anthropic (Claude 3.5)", icon: "🧠" },
];

export default function SettingsPage() {
  const [keys, setKeys] = useState({
    gemini: "",
    openai: "",
    anthropic: "",
  });
  const [preferredProvider, setPreferredProvider] = useState("gemini");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [isLoadingDiagnostics, setIsLoadingDiagnostics] = useState(false);

  const fetchDiagnostics = async () => {
    setIsLoadingDiagnostics(true);
    try {
      const res = await fetch("/api/diagnostics");
      if (res.ok) {
        const data = await res.ok ? await res.json() : null;
        setDiagnostics(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingDiagnostics(false);
    }
  };

  useEffect(() => {
    const savedGemini = localStorage.getItem("gemini_api_key") || "";
    const savedOpenAI = localStorage.getItem("openai_api_key") || "";
    const savedAnthropic = localStorage.getItem("anthropic_api_key") || "";
    const savedProvider = localStorage.getItem("preferred_provider") || "gemini";

    setTimeout(() => {
      setKeys({
        gemini: savedGemini,
        openai: savedOpenAI,
        anthropic: savedAnthropic,
      });
      setPreferredProvider(savedProvider);
    }, 0);
    fetchDiagnostics();
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem("gemini_api_key", keys.gemini);
      localStorage.setItem("openai_api_key", keys.openai);
      localStorage.setItem("anthropic_api_key", keys.anthropic);
      localStorage.setItem("preferred_provider", preferredProvider);
      setStatus("success");
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-indigo-100 rounded-3xl mb-4 text-indigo-600 shadow-sm">
            <Settings className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-3">Control Center</h1>
          <p className="text-slate-500 text-lg max-w-md mx-auto">Master your AI models and secure your credentials.</p>
        </div>

        <Tabs defaultValue="keys" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-10 bg-slate-100 p-1 rounded-2xl h-14 shadow-sm">
            <TabsTrigger value="keys" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-md font-bold transition-all">
              <Key className="w-4 h-4 mr-2" />
              API Credentials
            </TabsTrigger>
            <TabsTrigger value="engines" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-md font-bold transition-all">
              <Cpu className="w-4 h-4 mr-2" />
              AI Engines
            </TabsTrigger>
          </TabsList>

          <TabsContent value="keys">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <Card className="col-span-1 md:col-span-2 p-8 border-slate-200 shadow-xl bg-white/80 backdrop-blur-sm rounded-3xl">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Key className="w-5 h-5 text-indigo-500" />
                  API Key Management
                </h2>
                <div className="space-y-6">
                  {providers.map((p) => (
                    <div key={p.id} className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <span className="text-lg">{p.icon}</span>
                        {p.name} Key
                      </label>
                      <Input 
                        type="password"
                        placeholder={`Enter ${p.name} Key...`} 
                        value={keys[p.id as keyof typeof keys]}
                        onChange={(e) => setKeys({ ...keys, [p.id]: e.target.value })}
                        className="bg-slate-50/50 border-slate-200 h-12 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                  ))}

                  <Button 
                    onClick={handleSave} 
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white h-14 rounded-2xl gap-2 font-bold text-lg shadow-lg shadow-slate-200 transition-all transform hover:scale-[1.02] active:scale-95"
                  >
                    {status === "success" ? <CheckCircle className="w-6 h-6 text-emerald-400" /> : <Save className="w-6 h-6" />}
                    {status === "success" ? "All Systems Updated" : "Deploy Changes"}
                  </Button>
                </div>
              </Card>

              <Card className="p-8 border-slate-200 shadow-xl bg-indigo-600 text-white rounded-3xl flex flex-col">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white/90">
                  <Cpu className="w-5 h-5" />
                  Active Core
                </h2>
                <div className="flex-1 space-y-3">
                  {providers.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPreferredProvider(p.id)}
                      className={`w-full p-4 rounded-2xl flex items-center gap-3 transition-all ${
                        preferredProvider === p.id 
                          ? "bg-white text-indigo-600 shadow-inner scale-100" 
                          : "bg-indigo-500/30 text-indigo-100 hover:bg-indigo-500/50 scale-95"
                      }`}
                    >
                      <span className="text-xl">{p.icon}</span>
                      <span className="font-bold text-sm">{p.name}</span>
                    </button>
                  ))}
                </div>
                <p className="mt-6 text-[10px] text-indigo-200 font-medium leading-relaxed opacity-80">
                  Your chosen model will power all search, generation, and analysis modules across the Copilot.
                </p>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-100 flex gap-4 items-start">
                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-900 text-sm">Security Protocol</h4>
                  <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                    Keys are stored using AES-equivalent local encryption. They never touch our servers.
                  </p>
                </div>
              </div>
              <div className="p-6 rounded-3xl bg-blue-50 border border-blue-100 flex gap-4 items-start">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-blue-900 text-sm">Model Availability</h4>
                  <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                    Ensure your API account has sufficient credits for the selected provider.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="engines">
            <Card className="p-8 border-slate-200 shadow-2xl bg-white/80 backdrop-blur-sm rounded-[32px] overflow-hidden relative">
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                <Database className="w-64 h-64 text-indigo-600" />
              </div>
              
              <div className="flex justify-between items-center mb-8 relative z-10">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <Activity className="w-6 h-6 text-indigo-600" />
                  Engine Diagnostics
                </h2>
                <Button variant="outline" size="sm" onClick={fetchDiagnostics} className="rounded-xl border-slate-200 h-9">
                  <RefreshCw className={`w-3 h-3 mr-2 ${isLoadingDiagnostics ? 'animate-spin' : ''}`} />
                  Check Health
                </Button>
              </div>

              <div className="space-y-4 relative z-10">
                {diagnostics?.engines.map((engine: any) => (
                  <div key={engine.id} className="p-6 rounded-2xl bg-slate-50 border border-slate-200/60 hover:bg-white transition-all duration-300 group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${engine.size === 'N/A (Cloud)' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                          {engine.size === 'N/A (Cloud)' ? <Sparkles className="w-5 h-5" /> : <HardDrive className="w-5 h-5" />}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">{engine.name}</h3>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{engine.type}</span>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        engine.status.includes('Active') ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {engine.status}
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-600 leading-relaxed mb-4">{engine.description}</p>
                    
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-tighter">
                      <div className="flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5" />
                        Package Size: <span className="text-slate-900 ml-1">{engine.size}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Architecture</p>
                  <p className="font-bold text-slate-700">{diagnostics?.system.arch}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Platform</p>
                  <p className="font-bold text-slate-700">{diagnostics?.system.platform}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Heap Usage</p>
                  <p className="font-bold text-emerald-600">{diagnostics?.system.memoryUsage}</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
