import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, MicOff, MessageSquare, ShieldCheck } from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import ConnectionVisualizer from "@/components/basic/teacher/ConnectionVisualizer";
import AudioWaveform from "@/components/basic/teacher/AudioWaveform";

const AudioCallInitiated: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-svh w-full flex-col items-center justify-center bg-[#f4f6ff] dark:bg-[#0b081e] px-6 py-8 overflow-hidden text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-6 rounded-[2.5rem] border border-slate-100 dark:border-[#221c4e] bg-white dark:bg-[#161233] text-slate-800 dark:text-slate-100 shadow-sm relative"
      >
        {/* Navigation / Header */}
        <Button 
          variant="outline"
          size="icon"
          onClick={() => navigate(-1)} 
          className="absolute top-6 left-6 h-9 w-9 rounded-xl border-slate-200 dark:border-[#221c4e] bg-white dark:bg-[#161233] text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-95 transition-all shadow-sm z-20"
        >
          <ChevronLeft size={18} />
        </Button>

        <header className="flex flex-col items-center gap-2 mb-4 text-center mt-4">
          <div className="relative">
            <ShieldCheck size={44} className="text-cyan-500" strokeWidth={2} />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-xs font-black text-slate-450 uppercase tracking-widest">
              VLM Academy
            </h1>
            <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Teacher App</p>
          </div>
          <h2 className="text-base font-black text-slate-850 dark:text-white uppercase tracking-tight mt-1">
            Audio Call Initiated
          </h2>
        </header>

        {/* Connection Participants */}
        <ConnectionVisualizer />

        {/* Call Timer */}
        <div className="text-center py-2">
          <h3 className="text-4xl font-black text-slate-850 dark:text-white tracking-tighter tabular-nums">
            00:04:15
          </h3>
        </div>

        {/* Audio Visualization */}
        <AudioWaveform />

        {/* Control Buttons */}
        <div className="flex gap-4 justify-center py-4">
          <Button 
            className="h-12 px-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-350 font-black text-xs uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-slate-850 gap-2 cursor-pointer shadow-xs"
          >
            <MicOff size={16} />
            Mute
          </Button>
          <Button 
            className="h-12 px-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-350 font-black text-xs uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-slate-850 gap-2 cursor-pointer shadow-xs"
          >
            <MessageSquare size={16} />
            Mini Chat
          </Button>
        </div>

        {/* End Call Action */}
        <div className="mt-2">
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
            <Button 
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:brightness-110 text-white font-black text-xs uppercase tracking-widest border-none shadow-md shadow-rose-500/20 active:scale-95 transition-all cursor-pointer"
            >
              End Call
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Footer Info */}
      <div className="mt-6 text-center">
        <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
          Session ID: VLM-AUDIO-D29341 | Type: Live Audio Session
        </p>
      </div>
    </div>
  );
};

export default AudioCallInitiated;