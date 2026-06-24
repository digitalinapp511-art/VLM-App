import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, ChevronRight, TriangleAlert } from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import CircularTimer from "@/components/basic/teacher/CircularTimer";

const SessionWarningPage: React.FC = () => {
  const [seconds, setSeconds] = useState(22);

  // Countdown simulation
  useEffect(() => {
    if (seconds > 0) {
      const timer = setTimeout(() => setSeconds(seconds - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [seconds]);

  return (
    <div className={cn("min-h-screen flex items-center justify-center p-6 relative overflow-hidden", bgCss)}>
      
      {/* Technical Background Decorative Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-10 h-full w-[1px] border-l border-dashed border-cyan-500/50" />
        <div className="absolute top-0 right-10 h-full w-[1px] border-l border-dashed border-cyan-500/50" />
        <div className="absolute top-20 right-20 text-[10px] font-mono text-cyan-500 tracking-widest">DATA</div>
        <div className="absolute top-10 left-8 w-2 h-2 bg-cyan-400 rounded-full blur-[2px]" />
        <div className="absolute bottom-20 left-10 w-2 h-2 bg-cyan-400 rounded-full blur-[2px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "w-full max-w-xl p-10 rounded-[3.5rem] border border-cyan-500/40 backdrop-blur-2xl relative",
          "bg-gradient-to-br from-zinc-950/90 via-zinc-950/80 to-[#0a192f]/60",
          "shadow-[0_0_80px_rgba(34,211,238,0.15)]"
        )}
      >
        {/* Header Icon */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <Bell size={64} className="text-white" strokeWidth={1.5} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[20%]">
              <TriangleAlert size={14} className="text-zinc-950 fill-white" />
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center space-y-6">
          <h1 className="text-2xl font-black text-white uppercase tracking-wider leading-tight">
            Session Auto-Close Warning
          </h1>
          
          <p className="text-zinc-400 text-base leading-relaxed px-4 font-medium">
            Your current session is about to <br />
            auto-close due to a period of inactivity. <br />
            Maintain your active teaching to <br />
            keep the connection.
          </p>
        </div>

        {/* Circular Countdown */}
        <CircularTimer seconds={seconds} />

        {/* Action Button */}
        <div className="mt-8">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              className={cn(
                "w-full h-16 rounded-[2rem] text-lg font-black uppercase tracking-widest",
                "bg-gradient-to-r from-[#2b4b9b] to-[#1a2e5d] hover:brightness-110",
                "border border-cyan-400/20 shadow-[0_10px_30px_rgba(34,211,238,0.2)] text-white group"
              )}
            >
              Continue Session 
              <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>

        {/* Footer Info */}
        <footer className="mt-10 text-center">
          <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest opacity-60">
            Session ID: VLM-129341
          </p>
        </footer>
      </motion.div>
    </div>
  );
};

export default SessionWarningPage;