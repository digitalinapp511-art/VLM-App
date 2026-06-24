import React from "react";
import { Calculator, MoreVertical, ArrowLeft, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const ChatHeader: React.FC = () => {
  return (
    <header className="flex items-center justify-between p-4 bg-black/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10" />
        <div className="flex flex-col">
          <h2 className="text-sm font-bold text-zinc-100 tracking-tight leading-tight">Student Alex P.</h2>
          <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">PHYS-C-101 Problems</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button className="p-2 rounded-xl bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white transition-colors">
          <Calculator size={18} />
        </button>
        <button className="p-2 rounded-xl bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white transition-colors">
          <MoreVertical size={18} />
        </button>
      </div>
    </header>
  );
};

export const ChatTimerBar: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="mx-4 mt-4 px-4 py-3 rounded-2xl bg-zinc-900/50 border border-white/5 flex items-center justify-between">
      <button 
        onClick={() => navigate(-1)}
        className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white"
      >
        <ArrowLeft size={16} />
      </button>
      
      <div className="flex flex-col items-center">
        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Session Time:</span>
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-cyan-400" />
          <p className="text-sm font-black tracking-tight">
            <span className="text-cyan-400">42:15</span> 
            <span className="text-zinc-600 mx-1">/</span> 
            <span className="text-purple-400">60:00</span>
          </p>
        </div>
      </div>
      <div className="w-8" /> {/* Spacer */}
    </div>
  );
};