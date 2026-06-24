import React from "react";
import type { LucideIcon } from "lucide-react";

// Standard Styled Input
export const LoginInput = ({ 
  icon: Icon, 
  placeholder, 
  type = "text", 
  rightElement 
}: { 
  icon: LucideIcon, 
  placeholder: string, 
  type?: string,
  rightElement?: React.ReactNode 
}) => (
  <div className="relative group">
    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-zinc-300 transition-colors">
      <Icon size={20} strokeWidth={1.5} />
    </div>
    <input
      type={type}
      placeholder={placeholder}
      className="w-full h-14 pl-14 pr-12 rounded-2xl border border-white/10 bg-zinc-900/40 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-white/20 transition-all"
    />
    {rightElement && (
      <div className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500">
        {rightElement}
      </div>
    )}
  </div>
);

// Section Divider
export const LoginDivider = ({ text }: { text: string }) => (
  <div className="flex items-center gap-4 py-4">
    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-zinc-800" />
    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] whitespace-nowrap">{text}</span>
    <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-zinc-800" />
  </div>
);