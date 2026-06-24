import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock } from "lucide-react";
const SessionInfoCard: React.FC = () => {
  return (
    <div className="p-5 rounded-[32px] border border-white/10 bg-white/[0.02] backdrop-blur-xl flex items-center gap-4 relative overflow-hidden">
      <div className="shrink-0">
        <Avatar className="w-16 h-16 border-2 border-white/5 shadow-xl">
          <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" />
          <AvatarFallback className="bg-zinc-800">SC</AvatarFallback>
        </Avatar>
      </div>
      
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="text-zinc-100 font-black text-[15px] uppercase tracking-tight">
            [Physics: Optimization]
          </h3>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20">
            <Clock size={12} className="text-yellow-500" />
            <span className="text-[9px] font-black text-yellow-500 uppercase tracking-widest">
              Session Ended
            </span>
          </div>
        </div>
        
        <div className="space-y-0.5">
          <p className="text-[11px] font-bold text-zinc-500">Student Avatar:</p>
          <p className="text-[12px] font-medium text-zinc-400">
            Sarah C. | <span className="text-zinc-500">VLM-S-1023</span> | <span className="text-zinc-600">Date: Oct 15, 2024</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SessionInfoCard;