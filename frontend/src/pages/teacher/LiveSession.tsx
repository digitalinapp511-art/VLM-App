import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  Mic, 
  Video, 
  SquarePen, 
  FileText, 
  PhoneOff,
  Star 
} from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";

import ParticipantFeed from "@/components/basic/teacher/ParticipantFeed";
import LiveControlButton from "@/components/basic/teacher/LiveControlButton";

const LiveSession: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={cn("min-h-screen flex flex-col items-center relative overflow-hidden", bgCss)}>
      {/* Header Bar */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-xl px-4 pt-6 pb-2"
      >
        <div className="flex items-center justify-between h-14 px-5 rounded-full border border-white/10 bg-zinc-950/40 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="text-zinc-400 hover:text-white transition-colors">
              <ChevronLeft size={20} strokeWidth={2.5} />
            </button>
            <h1 className="text-sm font-black text-white uppercase tracking-widest">
              Live Session: Calculus 101
            </h1>
          </div>
          
          <div className="px-3 py-1 rounded-full bg-white/10 border border-white/5">
            <span className="text-[11px] font-bold text-zinc-300 tabular-nums">45:32</span>
          </div>
        </div>
      </motion.header>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-xl relative flex flex-col items-center justify-center">
        
        {/* Floating Participant Feed */}
        <div className="absolute top-6 right-6 z-10">
          <ParticipantFeed name="Aisha Gupta" />
        </div>

        {/* Teacher Identity Display */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center space-y-2 mt-auto mb-32"
        >
          <h2 className="text-3xl font-serif text-white tracking-wide opacity-90 italic">
            DR. SARAH JOHNSON,
          </h2>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em]">
            Math Faculty
          </p>
        </motion.div>

        {/* Decorative Assets */}
        <div className="absolute top-1/3 left-10 text-blue-500/10 blur-[1px]">
          <Star size={24} fill="currentColor" />
        </div>
      </div>

      {/* Bottom Controls Sheet */}
      <motion.footer
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className={cn(
          "w-full max-w-xl p-8 rounded-t-[48px] border-t border-white/10 relative z-20",
          "bg-gradient-to-b from-[#1c122b] to-[#0c0c0c]"
        )}
      >
        {/* Pull Indicator */}
        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8" />

        <div className="flex items-center justify-around w-full">
          <LiveControlButton 
            icon={<Mic />} 
            label="Mic On" 
          />
          <LiveControlButton 
            icon={<Video />} 
            label="Cam On" 
          />
          <LiveControlButton 
            icon={<SquarePen />} 
            label="Whiteboard" 
            variant="active" 
          />
          <LiveControlButton 
            icon={<FileText />} 
            label="Files" 
          />
          <LiveControlButton 
            icon={<PhoneOff className="-rotate-[135deg]" />} 
            label="End Session" 
            variant="danger" 
            onClick={() => navigate("/teacher/dashboard")}
          />
        </div>
      </motion.footer>

      {/* Background Gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[40%] bg-blue-600/5 blur-[120px] pointer-events-none" />
    </div>
  );
};

export default LiveSession;