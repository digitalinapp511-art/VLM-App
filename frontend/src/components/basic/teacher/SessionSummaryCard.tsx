import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";

interface SessionSummaryCardProps {
  teacherName: string;
  role: string;
  summary: string;
  avatarUrl?: string;
}

const SessionSummaryCard: React.FC<SessionSummaryCardProps> = ({
  teacherName,
  role,
  summary,
  avatarUrl,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-[2rem] border border-white/5 bg-zinc-900/40 backdrop-blur-md shadow-inner"
    >
      <div className="space-y-4">
        {/* Card Header */}
        <div className="pb-3 border-b border-white/5">
          <p className="text-[11px] font-bold text-zinc-500 tracking-wider">
            Session Summary by {teacherName}
          </p>
        </div>

        {/* Profile Section */}
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12 border border-white/10">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="bg-zinc-800 text-white font-bold">
              EP
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <h4 className="text-[15px] font-bold text-white tracking-tight">
              {teacherName}
            </h4>
            <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest">
              {role}
            </p>
          </div>
        </div>

        {/* Summary Text */}
        <p className="text-[13px] leading-relaxed text-zinc-400 font-medium">
          {summary}
        </p>
      </div>
    </motion.div>
  );
};

export default SessionSummaryCard;