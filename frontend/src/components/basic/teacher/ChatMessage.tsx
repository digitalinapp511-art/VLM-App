import React from "react";
import {  Pause } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface MessageProps {
  variant: "student" | "teacher";
  children: React.ReactNode;
}

export const TextBubble: React.FC<MessageProps> = ({ variant, children }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn(
      "max-w-[85%] p-4 rounded-2xl text-sm font-medium leading-relaxed mb-3",
      variant === "student" 
        ? "self-start bg-teal-950/30 border border-teal-900/50 text-zinc-100" 
        : "self-end bg-purple-950/20 border border-purple-900/30 text-zinc-200"
    )}
  >
    {children}
  </motion.div>
);

export const ImageMessage: React.FC = () => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="self-start w-64 aspect-square rounded-2xl border border-teal-900/30 bg-zinc-900/50 p-4 mb-3 flex items-end"
  >
    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Image preview</span>
  </motion.div>
);

export const AudioMessage: React.FC = () => (
  <motion.div 
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    className="self-end w-72 p-4 rounded-2xl bg-purple-950/20 border border-purple-900/30 mb-3 space-y-3"
  >
    <div className="flex items-center gap-3">
      <button className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-white">
        <Pause size={18} fill="currentColor" />
      </button>
      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full relative">
        <div className="absolute left-0 top-0 h-full w-2/3 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.6)]" />
        <div className="absolute left-[66%] top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg" />
      </div>
    </div>
    <p className="text-[10px] font-bold text-zinc-500 pl-1">Explanation • 1:12</p>
  </motion.div>
);