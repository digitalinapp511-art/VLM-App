import React from "react";
import { Clock } from "lucide-react";
export const RequestBadge: React.FC = () => (
  <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#1e2a4a]/40 border border-white/5">
    <div className="w-6 h-6 rounded-lg bg-yellow-500/10 flex items-center justify-center border border-yellow-500/30">
      <span className="text-yellow-500 font-black text-[10px]">V</span>
    </div>
    <span className="text-cyan-400 font-bold text-[13px] tracking-tight">
      tutor since 2021 | followed student
    </span>
  </div>
);

export const TimerPill: React.FC<{ time: string }> = ({ time }) => (
  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20">
    <Clock className="text-rose-500" size={16} />
    <span className="text-rose-500 font-bold text-sm">
      Expires in: <span className="font-black">{time}</span>
    </span>
  </div>
);