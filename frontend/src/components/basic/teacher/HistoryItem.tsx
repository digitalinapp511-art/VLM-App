import React from "react";
import { cn } from "@/lib/utils";
import { 
  MessageSquare, 
  Video, 
  Camera, 
  Briefcase, 
  LayoutGrid, 
  AlertTriangle 
} from "lucide-react";

interface HistoryItemProps {
  type: "chat" | "video_lesson" | "live_class" | "course" | "short_video" | "penalty";
  title: string;
  subtitle: string;
  timestamp: string;
  points: string;
  isNegative?: boolean;
}

const iconMap = {
  chat: MessageSquare,
  video_lesson: Video,
  live_class: Camera,
  course: Briefcase,
  short_video: LayoutGrid,
  penalty: AlertTriangle,
};

const HistoryItem: React.FC<HistoryItemProps> = ({ 
  type, title, subtitle, timestamp, points, isNegative 
}) => {
  const Icon = iconMap[type];

  return (
    <div className="flex items-center gap-4 py-5 border-b border-white/5 last:border-0">
      <div className={cn(
        "w-12 h-12 rounded-full flex items-center justify-center border",
        isNegative 
          ? "bg-rose-500/10 border-rose-500/20 text-rose-500" 
          : "bg-zinc-800/50 border-white/5 text-zinc-400"
      )}>
        <Icon size={20} strokeWidth={isNegative ? 2.5 : 1.5} />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-[15px] font-bold text-zinc-100 truncate">{title}</h4>
        <p className="text-[11px] font-medium text-zinc-500 truncate leading-relaxed">
          {subtitle}
        </p>
        <p className="text-[11px] font-medium text-zinc-600">
          {timestamp}
        </p>
      </div>

      <div className="text-right shrink-0">
        <span className={cn(
          "text-[15px] font-black tracking-tight",
          isNegative ? "text-rose-500" : "text-cyan-400"
        )}>
          {isNegative ? "-" : "+"}{points} pts
        </span>
      </div>
    </div>
  );
};

export default HistoryItem;