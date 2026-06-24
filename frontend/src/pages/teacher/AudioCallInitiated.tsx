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
    <div className={cn("min-h-screen flex items-center justify-center p-6 relative overflow-hidden", bgCss)}>
      
      {/* Technical Background Grid Layer */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 right-14 h-full w-[1px] border-l border-dashed border-cyan-500/50" />
        <div className="absolute top-14 right-20 text-[10px] font-mono text-cyan-500 tracking-widest uppercase">Data</div>
        <div className="absolute top-0 left-14 h-full w-[1px] border-l border-dashed border-cyan-500/50" />
        <div className="absolute top-10 right-10 w-2 h-2 bg-cyan-400 rounded-full blur-[2px]" />
        <div className="absolute bottom-10 left-10 w-2 h-2 bg-cyan-400 rounded-full blur-[2px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "w-full max-w-xl p-8 rounded-[3.5rem] border-2 border-cyan-500/40 backdrop-blur-3xl relative",
          "bg-gradient-to-br from-zinc-950/95 via-zinc-950/90 to-[#0a192f]/70",
          "shadow-[0_0_100px_rgba(34,211,238,0.1)]"
        )}
      >
        {/* Navigation / Header */}
        <button 
          onClick={() => navigate(-1)} 
          className="absolute top-8 left-8 p-2 text-white/80 hover:text-white transition-colors"
        >
          <ChevronLeft size={28} />
        </button>

        <header className="flex flex-col items-center gap-4 mb-8">
          <div className="relative">
            <ShieldCheck size={48} className="text-cyan-400" strokeWidth={1.5} />
            <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full -z-10" />
          </div>
          <div className="text-center space-y-1">
            <h1 className="text-lg font-black text-white uppercase tracking-widest">
              VLM Academy
            </h1>
            <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Teacher App</p>
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight mt-2">
            Audio Call Initiated
          </h2>
        </header>

        {/* Connection Participants */}
        <ConnectionVisualizer />

        {/* Call Timer */}
        <div className="text-center py-4">
          <h3 className="text-5xl font-black text-white tracking-tighter tabular-nums">
            00:04:15
          </h3>
        </div>

        {/* Audio Visualization */}
        <AudioWaveform />

        {/* Control Buttons */}
        <div className="flex gap-4 justify-center py-6">
          <Button 
            className="h-14 px-8 rounded-full border border-white/10 bg-zinc-900/60 text-white font-bold uppercase tracking-tight gap-3 hover:bg-zinc-800"
          >
            <MicOff size={20} />
            Mute
          </Button>
          <Button 
            className="h-14 px-8 rounded-full border border-white/10 bg-zinc-900/60 text-white font-bold uppercase tracking-tight gap-3 hover:bg-zinc-800"
          >
            <MessageSquare size={20} />
            Mini Chat
          </Button>
        </div>

        {/* End Call Action */}
        <div className="mt-4">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              className={cn(
                "w-full h-20 rounded-[2.5rem] text-2xl font-black uppercase tracking-widest",
                "bg-gradient-to-r from-red-600 via-red-800 to-red-600 hover:brightness-110",
                "shadow-[0_10px_40px_rgba(220,38,38,0.3)] text-white"
              )}
            >
              End Call
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Footer Info */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full text-center">
        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest opacity-60">
          Session ID: VLM-AUDIO-D29341 | Type: Live Audio Session
        </p>
      </div>
    </div>
  );
};

export default AudioCallInitiated;