import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ShieldCheck } from "lucide-react";

interface TicketStatusCardProps {
  ticketId: string;
  category: string;
  createdAt: string;
}

const TicketStatusCard: React.FC<TicketStatusCardProps> = ({ ticketId, category, createdAt }) => {
  const statuses = ["IN REVIEW", "Open", "Resolved", "Closed"];
  const currentStatus = "IN REVIEW";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-[32px] border border-white/10 bg-zinc-950/40 backdrop-blur-xl space-y-6 shadow-xl"
    >
      <div className="text-center space-y-1">
        <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
          Ticket #{ticketId} | Category: {category} | Created: {createdAt}
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {statuses.map((status) => (
          <button
            key={status}
            className={cn(
              "px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap",
              status === currentStatus
                ? "border-cyan-400 bg-cyan-400/5 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                : "border-white/5 bg-zinc-900/40 text-zinc-500"
            )}
          >
            {status === currentStatus && <ShieldCheck size={12} className="inline mr-1.5" />}
            {status}
          </button>
        ))}
      </div>

      {/* Progress Track */}
      <div className="relative px-2 py-4">
        <div className="h-[2px] w-full bg-zinc-800 rounded-full" />
        <div className="absolute top-1/2 -translate-y-1/2 left-0 h-[2px] w-1/3 bg-gradient-to-r from-cyan-400 to-purple-500" />
        
        {/* Markers */}
        <div className="absolute top-1/2 -translate-y-1/2 left-2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_cyan]" />
        <div className="absolute top-1/2 -translate-y-1/2 left-1/3 w-4 h-4 rounded-full bg-zinc-950 border-2 border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
        <div className="absolute top-1/2 -translate-y-1/2 left-1/2 w-2 h-2 rounded-full bg-zinc-800" />
        <div className="absolute top-1/2 -translate-y-1/2 left-[70%] w-2 h-2 rounded-full bg-zinc-800" />
        <div className="absolute top-1/2 -translate-y-1/2 left-[90%] w-2 h-2 rounded-full bg-zinc-800" />
      </div>
    </motion.div>
  );
};

export default TicketStatusCard;