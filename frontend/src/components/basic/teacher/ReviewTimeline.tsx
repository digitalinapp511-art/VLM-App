import React from "react";
import { Check, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface TimelineStepProps {
  title: string;
  subtitle: string;
  status: "completed" | "pending";
  isLast?: boolean;
}

const TimelineStep: React.FC<TimelineStepProps> = ({ title, subtitle, status, isLast }) => {
  const isCompleted = status === "completed";

  return (
    <div className="flex items-start gap-4">
      <div className="flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all duration-500",
            isCompleted 
              ? "bg-zinc-800/50 border-emerald-500/50 text-emerald-500" 
              : "bg-zinc-800/50 border-[#2ec4b6] text-[#2ec4b6] shadow-[0_0_15px_rgba(46,196,182,0.3)]"
          )}
        >
          {isCompleted ? <Check size={24} strokeWidth={3} /> : <Clock size={24} />}
        </motion.div>
        
        {!isLast && (
          <div className={cn(
            "w-0.5 h-10 transition-colors duration-500",
            isCompleted ? "bg-emerald-500/50" : "bg-zinc-700"
          )} />
        )}
      </div>

      <div className="pt-1">
        <h4 className={cn(
          "text-sm font-bold uppercase tracking-tight",
          status === "pending" ? "text-[#2ec4b6]" : "text-zinc-100"
        )}>
          {title}
        </h4>
        <p className="text-[11px] font-medium text-zinc-500 mt-0.5">
          {subtitle}
        </p>
      </div>
    </div>
  );
};

const ReviewTimeline: React.FC = () => {
  return (
    <div className="space-y-0">
      <div className="mb-6">
        <h3 className="text-zinc-100 font-bold text-lg inline-block relative">
          Premium Timeline
          <div className="absolute -bottom-2 left-0 w-full h-1 bg-[#2ec4b6] rounded-full shadow-[0_2px_10px_rgba(46,196,182,0.5)]" />
        </h3>
      </div>
      
      <div className="space-y-0 pt-4">
        <TimelineStep 
          title="Profile Submitted" 
          subtitle="e.g. Sep 15, 2024" 
          status="completed" 
        />
        <TimelineStep 
          title="Interview Completed" 
          subtitle="e.g. Sep 18, 2024" 
          status="completed" 
        />
        <TimelineStep 
          title="Admin Review Pending" 
          subtitle="" 
          status="pending" 
          isLast 
        />
      </div>
    </div>
  );
};

export default ReviewTimeline;