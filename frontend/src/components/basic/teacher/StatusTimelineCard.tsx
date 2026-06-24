import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check, AlertTriangle, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export type StatusType = "approved" | "action" | "review" | "rejected";

interface StatusTimelineCardProps {
  status: StatusType;
  topic: string;
  date?: string;
  notes?: string;
  buttonText?: string;
  isDetailed?: boolean;
  children?: React.ReactNode;
}

const statusConfig = {
  approved: {
    color: "border-cyan-400",
    shadow: "shadow-[0_0_20px_rgba(34,211,238,0.15)]",
    dot: "bg-cyan-400",
    icon: <Check className="text-cyan-400" size={20} strokeWidth={3} />,
  },
  action: {
    color: "border-orange-500",
    shadow: "shadow-[0_0_20px_rgba(249,115,22,0.1)]",
    dot: "bg-orange-500",
    icon: <AlertTriangle className="text-orange-500" size={20} />,
  },
  review: {
    color: "border-yellow-500",
    shadow: "shadow-[0_0_20px_rgba(234,179,8,0.1)]",
    dot: "bg-yellow-500",
    icon: <Clock className="text-yellow-500" size={20} />,
  },
  rejected: {
    color: "border-red-500",
    shadow: "shadow-[0_0_20px_rgba(239,68,68,0.1)]",
    dot: "bg-red-500",
    icon: <X className="text-red-500" size={20} />,
  },
};

const StatusTimelineCard: React.FC<StatusTimelineCardProps> = ({
  status,
  topic,
  date,
  notes,
  buttonText,
//   isDetailed = false,
  children,
}) => {
  const config = statusConfig[status];

  return (
    <div className="flex gap-4 relative">
      {/* Timeline Visuals */}
      <div className="flex flex-col items-center">
        <div className={cn("w-3 h-3 rounded-full z-10 mt-6", config.dot)} />
        <div className="w-[1px] flex-1 bg-zinc-800" />
      </div>

      {/* Card Content */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className={cn(
          "flex-1 p-5 rounded-[28px] border bg-[#121212]/80 backdrop-blur-xl mb-6 relative overflow-hidden",
          config.color,
          config.shadow
        )}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-zinc-100 font-bold text-lg leading-tight">
              {status === "approved" ? topic : `TOPIC: ${topic}`}
            </h3>
            {date && <p className="text-zinc-500 text-xs mt-1">{date}</p>}
          </div>
          {config.icon}
        </div>

        {notes && (
          <div className="space-y-1 mb-4">
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
              Moderation Notes
            </span>
            <p className="text-zinc-300 text-sm">{notes}</p>
          </div>
        )}

        {children}

        {buttonText && (
          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "rounded-full px-6 h-9 text-[11px] font-bold uppercase tracking-widest border-zinc-700 bg-transparent hover:bg-white/5",
                status === "approved" && "w-full h-12 rounded-full border-cyan-400/50 text-white hover:bg-cyan-400/10 text-sm"
              )}
            >
              {buttonText}
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default StatusTimelineCard;