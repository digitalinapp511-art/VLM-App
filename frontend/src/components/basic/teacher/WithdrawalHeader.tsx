import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const WithdrawalHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header className="w-full flex items-center justify-between py-4 px-1">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-white hover:bg-zinc-800 transition-colors"
        >
          <ArrowLeft size={20} strokeWidth={2.5} />
        </button>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-black text-white uppercase tracking-tight">Withdrawal Processing</span>
            <span className="text-xs">🔥</span>
          </div>
          <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest leading-none">
            Dr. Sarah Johnson | VLM-TR-1021
          </p>
        </div>
      </div>
      
      <div className="w-10 h-10 rounded-full border-2 border-cyan-400/50 bg-zinc-900 shadow-[0_0_10px_rgba(34,211,238,0.3)]" />
    </header>
  );
};

export default WithdrawalHeader;