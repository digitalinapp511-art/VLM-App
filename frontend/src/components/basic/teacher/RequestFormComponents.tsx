import React from "react";
import { ChevronDown,  Gift, Tag} from "lucide-react";

export const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="p-6 rounded-[32px] border border-white/5 bg-white/[0.02] space-y-4">
    <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest ml-1">{title}</h3>
    {children}
  </div>
);

export const FormSelect: React.FC<{ label: string; placeholder: string }> = ({ label, placeholder }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">{label}</label>
    <div className="flex items-center justify-between h-14 px-5 rounded-2xl border border-white/10 bg-zinc-900/40 text-zinc-400">
      <span className="text-sm font-medium">{placeholder}</span>
      <ChevronDown size={18} className="text-zinc-600" />
    </div>
  </div>
);

export const SessionTypeToggle: React.FC = () => (
  <div className="flex items-center gap-4">
    <button className="flex-1 flex items-center justify-center gap-3 h-14 rounded-full border-2 border-cyan-400 bg-cyan-400/5 shadow-[0_0_15px_rgba(34,211,238,0.2)] text-cyan-400 transition-all">
      <Gift size={20} />
      <span className="text-xs font-black uppercase tracking-widest">Free Session</span>
    </button>
    
    <div className="flex-1 space-y-2 opacity-40">
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 w-fit">
        <Tag size={12} className="text-zinc-400" />
        <span className="text-[9px] font-black uppercase tracking-tight text-zinc-400">Paid Session</span>
      </div>
      <div className="h-14 px-5 rounded-2xl border border-white/10 bg-zinc-900/20 flex items-center">
        <span className="text-zinc-700 text-sm">Price</span>
      </div>
    </div>
  </div>
);