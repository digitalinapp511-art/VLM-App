import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Book, Clock, CircleDollarSign, Calendar, CheckSquare, Hourglass } from "lucide-react";

interface SessionCardProps {
  studentName: string;
  grade: string;
  subject: string;
  duration: string;
  earnings: string;
  date: string;
  status: "RESOLVED" | "UNRESOLVED";
}

const SessionItemCard: React.FC<SessionCardProps> = ({
  studentName,
  grade,
  subject,
  duration,
  earnings,
  date,
  status,
}) => {
  const isResolved = status === "RESOLVED";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        "p-5 rounded-[32px] border bg-black/40 backdrop-blur-md mb-4 flex flex-col gap-4",
        isResolved ? "border-cyan-500/40" : "border-orange-500/40 shadow-[0_0_10px_rgba(249,115,22,0.1)]"
      )}
    >
      {/* Header Info */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full border border-cyan-400/30 bg-zinc-900" />
        <h3 className="text-white font-bold text-lg">
          {studentName} <span className="text-zinc-500 font-medium text-sm ml-1">| {grade}</span>
        </h3>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Subject</p>
          <div className="flex items-center gap-1.5 text-zinc-300">
            <Book size={14} className="text-rose-400" />
            <span className="text-[13px] font-medium">{subject}</span>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Duration</p>
          <div className="flex items-center gap-1.5 text-zinc-300">
            <Clock size={14} className="text-zinc-500" />
            <span className="text-[13px] font-medium">{duration}</span>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Earnings</p>
          <div className="flex items-center gap-1.5">
            <CircleDollarSign size={14} className="text-yellow-600" />
            <span className="text-[13px] font-black text-emerald-400">${earnings}</span>
          </div>
        </div>
      </div>

      {/* Footer Details */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2 text-zinc-400">
          <Calendar size={14} className="text-rose-400/70" />
          <span className="text-[11px] font-medium">{date}</span>
        </div>

        <div className={cn(
          "px-3 py-1.5 rounded-full border text-[9px] font-black flex items-center gap-1.5 tracking-widest transition-all",
          isResolved 
            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" 
            : "border-orange-500/40 bg-orange-500/10 text-orange-400"
        )}>
          STATUS: {status}
          {isResolved ? <CheckSquare size={12} strokeWidth={3} /> : <Hourglass size={12} strokeWidth={3} />}
        </div>
      </div>
    </motion.div>
  );
};

export default SessionItemCard;