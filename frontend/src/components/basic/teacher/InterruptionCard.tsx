import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import InterruptionIcon from "./InterruptionIcon";
import { RefreshCw } from "lucide-react";
import { Home } from "lucide-react";

interface InterruptionCardProps {
  onReconnect: () => void;
  onReturn: () => void;
  isRetrying?: boolean;
}

const InterruptionCard: React.FC<InterruptionCardProps> = ({ 
  onReconnect, 
  onReturn,
  isRetrying = false 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "w-full max-w-xl mx-auto p-8 md:p-12 rounded-[48px] border border-white/5",
        "bg-zinc-900/40 backdrop-blur-3xl shadow-2xl relative flex flex-col text-center"
      )}
    >
      <InterruptionIcon />

      <div className="space-y-4 mb-8">
        <h2 className="text-3xl font-black text-white uppercase tracking-tight leading-tight">
          Session Interruption
        </h2>
        
        <div className="flex justify-center">
          <Badge variant="outline" className="rounded-full border-cyan-400/50 text-cyan-400 bg-cyan-400/5 px-6 py-1.5 font-black text-[10px] tracking-widest uppercase">
            Live Class Session
          </Badge>
        </div>
      </div>

      <p className="text-zinc-400 text-sm md:text-base leading-relaxed mb-6 px-4 font-medium">
        Your real-time connection to the live class session was lost. We are automatically attempting to restore the link. This might take a few moments. Please be patient.
      </p>

      <p className="text-[11px] font-bold text-zinc-600 uppercase tracking-[0.15em] mb-10">
        Error Code: RT_DISCONNECT_303
      </p>

      <div className="space-y-8">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={onReconnect}
            disabled={isRetrying}
            className={cn(
              "w-full h-16 rounded-2xl text-lg font-bold transition-all",
              "bg-gradient-to-b from-[#2b4b9b] to-[#1a2e5d] hover:brightness-110",
              "border border-blue-400/20 shadow-[0_0_30px_rgba(37,99,235,0.3)]",
              "text-white flex items-center justify-center gap-3 uppercase tracking-wider"
            )}
          >
            <RefreshCw size={24} className={cn(isRetrying && "animate-spin")} />
            {isRetrying ? "Attempting..." : "Try to Reconnect"}
          </Button>
        </motion.div>

        <button 
          onClick={onReturn}
          className="flex items-center justify-center gap-2 mx-auto text-zinc-400 hover:text-white transition-colors group"
        >
          <Home size={18} className="text-zinc-500 group-hover:text-white" />
          <span className="text-sm font-bold border-b border-zinc-700 group-hover:border-white uppercase tracking-widest">
            Return to Dashboard
          </span>
        </button>
      </div>
    </motion.div>
  );
};

export default InterruptionCard;