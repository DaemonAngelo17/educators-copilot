"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface AIProgressProps {
  isLoading: boolean;
  label?: string;
}

export function AIProgress({ isLoading, label = "AI is thinking..." }: AIProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) return prev;
          // Slowly slow down as we get closer to 95%
          const step = Math.max(0.5, (95 - prev) / 10);
          return Math.min(95, prev + step);
        });
      }, 200);
    } else {
      setProgress(100);
    }

    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading && progress === 100) return null;

  return (
    <div className="w-full space-y-2 my-4">
      <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">
        <span>{label}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
        <motion.div 
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
