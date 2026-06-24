import { Star } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";

export const LiveClassCard: React.FC<{ title: string; student: string; time: string }> = ({ title, student, time }) => (
  <div className="p-4 rounded-xl border border-white/5 bg-white/[0.03] relative overflow-hidden">
    <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400" />
    <h4 className="text-[13px] font-bold text-white mb-1">{title}</h4>
    <p className="text-[11px] text-zinc-500 mb-2">Student: {student}</p>
    <div className="flex items-center gap-1 text-[11px] font-black text-cyan-400 uppercase">
      <span>{time}</span>
      <span className="opacity-40 ml-1">| 30m</span>
    </div>
  </div>
);

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

export const ReviewItem: React.FC<{ text: string; student: string }> = ({ text, student }) => (
  <div className="space-y-1 py-1">
    <div className="flex justify-between items-center">
      <div className="flex gap-0.5 text-yellow-500">
        {[...Array(5)].map((_, i) => <Star key={i} size={10} fill="currentColor" />)}
      </div>
      <span className="text-[9px] font-bold text-zinc-600 uppercase">2h ago</span>
    </div>
    <p className="text-[12px] font-medium text-zinc-300">{text}</p>
    <p className="text-[10px] text-zinc-500">Student: {student}</p>
  </div>
);