// src/components/doubts/DoubtCard.tsx
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface DoubtCardProps {
  subject: string;
  topic: string;
  teacher: string;
  avatar: string;
  time: string;
  date: string;
  doubt: string;
  status: "solved" | "pending" | string;
}

export default function DoubtCard({ subject, topic, teacher, avatar, time, date, doubt, status }: DoubtCardProps) {
  const isSolved = status === "solved";
  
  return (
    <div className={cn(
      "p-[1px] rounded-3xl bg-gradient-to-br transition-all duration-300",
      isSolved ? "from-emerald-500/40 to-transparent" : "from-amber-500/40 to-transparent"
    )}>
      <div className="bg-[#121212]/90 backdrop-blur-xl rounded-[calc(1.5rem-1px)] p-5 space-y-4">
        
        {/* Top Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-1.5 rounded-full border bg-transparent",
              isSolved ? "border-emerald-500/50 text-emerald-400" : "border-amber-500/50 text-amber-400"
            )}>
              <HelpCircle size={18} />
            </div>
            <h3 className="font-bold text-white tracking-tight">
              {subject} - <span className="font-medium text-white/90">{topic}</span>
            </h3>
          </div>
          <Badge className={cn(
            "uppercase text-[10px] font-black px-3 py-0.5 border-none",
            isSolved ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
          )}>
            {status}
          </Badge>
        </div>

        {/* Middle Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 border border-white/10">
              <AvatarImage src={avatar} />
              <AvatarFallback>{teacher[0]}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-white/60 font-medium">{teacher}</span>
          </div>
          <span className="text-[10px] text-white/40 font-bold uppercase tracking-tight">
            {time}, {date}
          </span>
        </div>

        {/* Bottom Section */}
        <p className="text-sm text-white/70 italic font-medium leading-relaxed pl-2 border-l border-white/10">
          "{doubt}"
        </p>
      </div>
    </div>
  );
}