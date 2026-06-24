import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { RequestBadge, TimerPill } from "./RequestStatus";

interface TeacherRequestCardProps {
  onAccept: () => void;
  onDecline: () => void;
}

const TeacherRequestCard: React.FC<TeacherRequestCardProps> = ({ onAccept, onDecline }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "relative w-full p-8 rounded-[40px] border-2 border-cyan-400/60",
        "bg-gradient-to-br from-[#1c3a8a] via-[#111827] to-[#111827]",
        "shadow-[0_0_50px_rgba(34,211,238,0.2)]"
      )}
    >
      {/* Header Floating Badge */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
        <div className="bg-[#facc15] px-6 py-2 rounded-xl shadow-[0_0_20px_rgba(250,204,21,0.4)]">
          <span className="text-black font-black text-xs uppercase tracking-widest">
            Preferred Teacher Request
          </span>
        </div>
      </div>

      {/* Student Info */}
      <div className="flex items-center gap-4 mb-6">
        <Avatar className="w-20 h-20 border-2 border-white/10">
          <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha" />
          <AvatarFallback className="bg-zinc-800 text-white">AS</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-white tracking-tight">Aisha Sharma</h3>
          <p className="text-zinc-400 text-[15px] font-medium">Grade 11 - JEE Prep</p>
        </div>
      </div>

      <div className="space-y-6">
        <RequestBadge />

        <div className="space-y-3">
          <h2 className="text-xl font-black text-white tracking-tight">
            Direct Request - Calculus Doubts
          </h2>
          <p className="text-zinc-400 text-[15px] leading-relaxed font-medium">
            Optimization Problems. Aisha needs a quick 1-on-1 session to clarify concepts on 
            maxima/minima applications. She has specifically requested you.
          </p>
        </div>

        <div className="flex items-center justify-between pt-2">
          {/* Subject Icon Placeholder */}
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
             <span className="text-zinc-400 text-lg font-serif">dy/dx</span>
          </div>
          
          <TimerPill time="5m 30s" />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-2">
          <Button
            variant="outline"
            onClick={onDecline}
            className="flex-1 h-16 rounded-[24px] border-zinc-700 bg-transparent text-white font-black uppercase tracking-widest hover:bg-white/5"
          >
            Decline
          </Button>
          <Button
            onClick={onAccept}
            className={cn(
              "flex-1 h-16 rounded-[24px] font-black uppercase tracking-widest",
              "bg-gradient-to-r from-blue-600 to-blue-800 text-white",
              "border border-cyan-400/30 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:brightness-110"
            )}
          >
            Accept Request
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default TeacherRequestCard;