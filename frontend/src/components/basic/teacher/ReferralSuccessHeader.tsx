import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ReferralSuccessHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header className="w-full flex items-center justify-between py-6 px-1">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-white hover:bg-zinc-800 transition-colors"
        >
          <ArrowLeft size={20} strokeWidth={2.5} />
        </button>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs">🔥</span>
            <span className="text-[14px] font-black text-white uppercase tracking-tight">Referral Reward Credited</span>
          </div>
          <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest leading-none">
            Dr. Sarah Johnson | VLM-TR-1021
          </p>
        </div>
      </div>
      
      <div className="relative">
        <div className="absolute inset-0 bg-cyan-400/30 blur-md rounded-full" />
        <Avatar className="w-10 h-10 border-2 border-cyan-400/50 bg-zinc-900 relative z-10">
          <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" />
          <AvatarFallback>SJ</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};

export default ReferralSuccessHeader;