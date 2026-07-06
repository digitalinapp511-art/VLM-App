import { Star } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";

export const LiveClassCard: React.FC<{ title: string; student: string; startedAt?: string; duration?: number }> = ({ title, student, startedAt, duration = 30 }) => {
  if (!startedAt) {
    return (
      <div className="p-4 rounded-xl border border-white/5 bg-white/[0.03] relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400" />
        <h4 className="text-[13px] font-bold text-white mb-1">{title}</h4>
        <p className="text-[11px] text-zinc-500 mb-2">Student: {student}</p>
        <div className="flex items-center gap-1 text-[11px] font-black text-cyan-400 uppercase">
          <span>Pending</span>
        </div>
      </div>
    );
  }

  const start = new Date(startedAt);
  const end = new Date(start.getTime() + duration * 60 * 1000);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  return (
    <div className="p-4 rounded-xl border border-white/5 bg-white/[0.03] relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400" />
      <h4 className="text-[13px] font-bold text-white mb-1">{title}</h4>
      <p className="text-[11px] text-zinc-500 mb-2">Student: {student}</p>
      <div className="flex items-center gap-1 text-[11px] font-black text-cyan-400 uppercase">
        <span>{formatTime(start)} - {formatTime(end)}</span>
        <span className="opacity-40 ml-1">| {duration}m</span>
      </div>
    </div>
  );
};

export const NotificationItem: React.FC<{ icon: React.ReactNode; text: string; student: string; color: string }> = ({ icon, text, student, color }) => (
  <div className="flex gap-3 items-start">
    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", color)}>
      {icon}
    </div>
    <div className="flex flex-col">
      <p className="text-[12px] font-bold text-zinc-200 leading-tight mb-1">{text}</p>
      <p className="text-[10px] text-zinc-500">Student: {student}</p>
    </div>
  </div>
);

export const ReviewItem: React.FC<{ text: string; student: string; time?: string }> = ({ text, student, time }) => (
  <div className="space-y-1 py-1">
    <div className="flex justify-between items-center">
      <div className="flex gap-0.5 text-yellow-500">
        {[...Array(5)].map((_, i) => <Star key={i} size={10} fill="currentColor" />)}
      </div>
      {time && <span className="text-[9px] font-bold text-zinc-600 uppercase">{time}</span>}
    </div>
    <p className="text-[12px] font-medium text-zinc-300">{text}</p>
    <p className="text-[10px] text-zinc-500">Student: {student}</p>
  </div>
);