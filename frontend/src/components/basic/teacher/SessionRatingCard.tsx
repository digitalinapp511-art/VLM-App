import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const tags = [
  { label: "ATTENTIVE", active: true },
  { label: "PARTICIPATIVE", active: true },
  { label: "HELPFUL", active: true },
  { label: "CHALLENGED", active: false },
  { label: "QUIET", active: false },
  { label: "UNSTABLE", active: false },
];

const SessionRatingCard: React.FC = () => {
  return (
    <div className="p-6 rounded-[32px] border border-white/10 bg-zinc-900/40 backdrop-blur-md space-y-6">
      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star 
            key={s} 
            size={32} 
            className={cn(s <= 4 ? "text-yellow-400 fill-yellow-400" : "text-zinc-600")} 
          />
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-2.5">
        {tags.map((tag) => (
          <span
            key={tag.label}
            className={cn(
              "px-4 py-1.5 rounded-full border text-[10px] font-black tracking-tight transition-all",
              tag.active 
                ? "border-cyan-500 bg-cyan-500/10 text-cyan-400" 
                : "border-white/5 bg-white/[0.02] text-zinc-600"
            )}
          >
            {tag.label}
          </span>
        ))}
      </div>

      <p className="text-center text-sm font-bold text-cyan-400">
        Overall Behaviour: 4.5 / 5.0 ★ <span className="text-white ml-1 font-black">| Excellent!</span>
      </p>
    </div>
  );
};

export default SessionRatingCard;