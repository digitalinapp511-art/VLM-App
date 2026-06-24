import React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react"; 

interface FieldProps {
  label: string;
  value: string;
  icon: LucideIcon;
  active?: boolean;
  className?: string;
}

export const VideoInputField: React.FC<FieldProps> = ({ label, value, icon: Icon }) => (
  <div className="w-full p-5 rounded-[24px] border border-white/10 bg-white/[0.03] backdrop-blur-md space-y-1">
    <div className="flex items-center gap-3">
      <Icon size={18} className="text-zinc-500" />
      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{label}</span>
    </div>
    <p className="text-[15px] font-bold text-zinc-100 pl-7">{value}</p>
  </div>
);

export const VideoSelectField: React.FC<FieldProps> = ({ label, value, icon: Icon, active }) => (
  <div className={cn(
    "flex-1 p-4 rounded-[22px] border transition-all duration-300 backdrop-blur-md space-y-1",
    active ? "border-cyan-400 bg-cyan-400/5 shadow-[0_0_15px_rgba(34,211,238,0.1)]" : "border-white/10 bg-white/[0.02]"
  )}>
    <div className="flex items-center gap-2">
      <Icon size={16} className={cn(active ? "text-cyan-400" : "text-zinc-500")} />
      <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{label}</span>
    </div>
    <div className="flex items-center justify-between pl-6">
      <span className={cn("text-[13px] font-bold", active ? "text-zinc-100" : "text-zinc-300")}>{value}</span>
      <ChevronDown size={14} className="text-zinc-600" />
    </div>
  </div>
);

export const VideoTextArea: React.FC<FieldProps> = ({ label, value, icon: Icon }) => (
  <div className="w-full p-5 rounded-[28px] border border-white/10 bg-white/[0.03] backdrop-blur-md space-y-3">
    <div className="flex items-start gap-3">
      <Icon size={18} className="text-zinc-500 mt-1" />
      <div className="space-y-1">
        <span className="text-[11px] font-bold text-zinc-500 tracking-tight">{label}</span>
        <p className="text-[13px] font-medium text-zinc-400 leading-relaxed">
          {value}
        </p>
      </div>
    </div>
    <div className="flex justify-end pt-1">
      <span className="text-[9px] font-bold text-zinc-700">Char Count: 0 / 500</span>
    </div>
  </div>
);