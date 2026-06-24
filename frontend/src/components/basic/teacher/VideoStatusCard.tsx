import React from "react";
import { motion } from "framer-motion";
import { Play, X, Pencil, Trash2, RotateCcw, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export type VideoStatus = "approved" | "pending" | "rejected";

interface VideoStatusCardProps {
  title: string;
  status: VideoStatus;
  views: string;
  moderationNote?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onResubmit?: () => void;
}

const statusConfig = {
  approved: {
    color: "border-emerald-500/50",
    glow: "shadow-[0_0_15px_rgba(16,185,129,0.15)]",
    badge: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    icon: <CheckCircle2 size={12} />,
    previewIcon: <Play size={20} className="fill-current text-white ml-1" />,
    circleColor: "border-emerald-500",
  },
  pending: {
    color: "border-amber-500/50",
    glow: "shadow-[0_0_15px_rgba(245,158,11,0.15)]",
    badge: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    icon: <Clock size={12} />,
    previewIcon: <Play size={20} className="fill-current text-white ml-1" />,
    circleColor: "border-amber-500",
  },
  rejected: {
    color: "border-rose-500/50",
    glow: "shadow-[0_0_15px_rgba(244,63,94,0.15)]",
    badge: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    icon: <AlertCircle size={12} />,
    previewIcon: <X size={24} className="text-white" />,
    circleColor: "border-rose-500",
  },
};

const VideoStatusCard: React.FC<VideoStatusCardProps> = ({
  title,
  status,
  views,
  onEdit,
  onDelete,
  onResubmit,
}) => {
  const config = statusConfig[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-5 rounded-[28px] border bg-[#121212]/80 backdrop-blur-xl mb-4 relative overflow-hidden",
        config.color,
        config.glow
      )}
    >
      <div className="flex gap-5">
        {/* Circular Preview Container */}
        <div className="relative shrink-0">
          <div className={cn(
            "w-20 h-20 rounded-full border-[3px] flex items-center justify-center bg-zinc-900/60 transition-all duration-500",
            config.circleColor
          )}>
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center shadow-inner">
              {config.previewIcon}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 space-y-3 pt-1">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
            <Badge variant="outline" className={cn("flex gap-1.5 items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", config.badge)}>
              {config.icon}
              {status}
            </Badge>
          </div>

          <div className="flex justify-end">
            <p className="text-xs font-black text-white uppercase tracking-tighter">
              {views} <span className="text-zinc-500 font-bold ml-0.5">views</span>
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Moderation Note</span>
            <div className="space-y-1 opacity-20">
               <div className="h-[2px] w-full bg-zinc-500 rounded-full" />
               <div className="h-[2px] w-2/3 bg-zinc-500 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end items-center gap-4 mt-2">
        {status === "rejected" ? (
          <>
            <button onClick={onResubmit} className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors">
              <RotateCcw size={14} />
              <span className="text-[11px] font-bold">Resubmit</span>
            </button>
            <button onClick={onDelete} className="flex items-center gap-1.5 text-zinc-400 hover:text-rose-400 transition-colors">
              <Trash2 size={14} />
              <span className="text-[11px] font-bold">Delete</span>
            </button>
          </>
        ) : (
          <>
            <button onClick={onEdit} className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors">
              <Pencil size={14} />
              <span className="text-[11px] font-bold">Edit</span>
            </button>
            {status === "approved" && (
              <button onClick={onDelete} className="flex items-center gap-1.5 text-zinc-400 hover:text-rose-400 transition-colors">
                <Trash2 size={14} />
                <span className="text-[11px] font-bold">Delete</span>
              </button>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default VideoStatusCard;