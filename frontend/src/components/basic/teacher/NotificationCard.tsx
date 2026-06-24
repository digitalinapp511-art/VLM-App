import React from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationCardProps {
  icon: LucideIcon;
  title: string;
  message: string;
  time: string;
  isUnread?: boolean;
  actionText: string;
  onAction: () => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  icon: Icon,
  title,
  message,
  time,
  isUnread = false,
  actionText,
  onAction,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className={cn(
        "relative p-5 rounded-[28px] border bg-[#121212]/60 backdrop-blur-xl transition-all duration-300",
        "border-white/10 hover:border-cyan-500/30 shadow-lg"
      )}
    >
      <div className="flex gap-4">
        {/* Icon Container */}
        <div className="shrink-0 w-12 h-12 rounded-2xl bg-cyan-400/5 border border-cyan-400/20 flex items-center justify-center text-cyan-400">
          <Icon size={24} strokeWidth={1.5} />
        </div>

        {/* Content Section */}
        <div className="flex-1 space-y-2">
          <div className="flex justify-between items-start">
            <h3 className="text-zinc-100 font-bold text-[15px] tracking-tight">
              {title}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">
                {time}
              </span>
              {isUnread && (
                <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              )}
            </div>
          </div>

          <p className="text-[13px] text-zinc-400 leading-relaxed pr-4 font-medium">
            {message}
          </p>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAction();
            }}
            className="text-[13px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors pt-1"
          >
            {actionText}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationCard;