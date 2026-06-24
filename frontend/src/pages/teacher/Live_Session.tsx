import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  Mic, 
  Video, 
  Monitor, 
  ScreenShare, 
  PhoneOff, 
  Users,
  Star
} from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";

import LiveControlButton from "@/components/basic/teacher/LiveControlButton";
import StudentLiveChat from "@/components/basic/teacher/StudentLiveChat";

const Live_Session: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={cn("min-h-screen flex flex-col items-center p-4 pb-10", bgCss)}>
      <div className="w-full max-w-xl space-y-5">
        
        {/* Header Capsule */}
        <header className="w-full h-14 rounded-full border border-white/10 bg-zinc-950/40 flex items-center px-6 backdrop-blur-md">
          <button onClick={() => navigate(-1)} className="text-zinc-400 hover:text-white transition-colors">
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
          <div className="flex-1 flex justify-center items-center gap-3">
            <span className="text-sm font-black text-white uppercase tracking-widest">Advanced Calculus</span>
            <span className="w-[1px] h-4 bg-zinc-700" />
            <span className="text-[11px] font-bold text-zinc-500 uppercase">Section C</span>
          </div>
        </header>

        {/* Status Indicators */}
        <div className="flex justify-between items-center px-2">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400 shadow-inner">
                <Mic size={18} />
             </div>
             <div className="flex items-center gap-2 bg-rose-500/10 px-3 py-1.5 rounded-full border border-rose-500/30">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Live</span>
             </div>
          </div>
          
          <div className="flex items-center gap-2">
             <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-tight">
                Students Online: <span className="text-white font-black ml-1">45</span>
             </span>
             <Users size={16} className="text-zinc-500" />
          </div>
        </div>

        {/* Video Feed Placeholder */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full aspect-[4/3] rounded-[40px] border border-white/10 bg-zinc-900/60 shadow-2xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Feed Overlay Info */}
          <div className="absolute bottom-6 left-6 px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-md border border-white/5">
             <span className="text-[11px] font-bold text-zinc-300 tabular-nums uppercase tracking-widest">00:18:45</span>
          </div>
          
          <div className="absolute bottom-6 right-6 px-4 py-2 rounded-xl bg-zinc-900/80 backdrop-blur-md border border-white/10">
             <span className="text-[11px] font-black text-white uppercase tracking-tight">Dr. Elena Petrova</span>
          </div>
        </motion.div>

        {/* Controls Card */}
        <div className="p-6 rounded-[32px] border border-white/5 bg-white/[0.02] flex items-center justify-between shadow-xl">
           <LiveControlButton icon={<Monitor />} label="Open Whiteboard" />
           <LiveControlButton icon={<Mic />} label="Mic On" active />
           <LiveControlButton icon={<Video />} label="Camera On" active />
           <LiveControlButton icon={<ScreenShare />} label="Share Screen" />
           <LiveControlButton icon={<PhoneOff className="-rotate-[135deg]" />} label="End Session" variant="danger" />
        </div>

        {/* Live Chat Component */}
        <StudentLiveChat />

      </div>

      {/* Decorative Assets */}
      <div className="fixed top-1/4 -right-2 text-purple-500/10 blur-[1px] pointer-events-none">
        <Star size={24} fill="currentColor" />
      </div>
      <div className="fixed bottom-1/3 -left-2 text-cyan-500/10 blur-[1px] pointer-events-none">
        <Star size={16} fill="currentColor" />
      </div>
    </div>
  );
};

export default Live_Session;