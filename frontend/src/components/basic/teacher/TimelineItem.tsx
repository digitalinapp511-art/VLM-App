import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TimelineItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: "completed" | "active" | "pending";
  isLast?: boolean;
}

const TimelineItem: React.FC<TimelineItemProps> = ({
  icon,
  title,
  description,
  status,
  isLast = false,
}) => {
  const isActive = status === "active";
  const isCompleted = status === "completed";

  return (
    <div className="flex gap-4 sm:gap-6 min-h-[80px] sm:min-h-[100px]">
      <div className="flex flex-col items-center">
        {/* Step Icon */}
        <motion.div
          initial={isActive ? { scale: 1 } : {}}
          animate={isActive ? { scale: [1, 1.05, 1] } : {}}
          transition={isActive ? { repeat: Infinity, duration: 2 } : {}}
          className={cn(
            "w-11 h-11 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border-2 transition-all duration-500 relative z-10",
            isCompleted && "bg-zinc-900 border-yellow-500 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]",
            isActive && "bg-zinc-900 border-cyan-400 text-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.5)]",
            status === "pending" && "bg-zinc-900 border-white/10 text-white/20"
          )}
        >
          {React.cloneElement(icon as React.ReactElement<any>, { className: "w-5 h-5 sm:w-6 sm:h-6" })}
          
          {/* Active Glow Ring */}
          {isActive && (
            <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-md -z-10 animate-pulse" />
          )}
        </motion.div>

        {/* Connector Line */}
        {!isLast && (
          <div 
            className={cn(
              "w-[2px] flex-1 my-1.5 transition-colors duration-500",
              isCompleted ? "bg-yellow-500" : "bg-white/10 border-l-2 border-dashed border-white/10 bg-transparent"
            )}
          />
        )}
      </div>

      {/* Content */}
      <div className={cn(
        "flex flex-col justify-center pb-6 transition-opacity duration-500",
        status === "pending" ? "opacity-30" : "opacity-100"
      )}>
        <h3 className={cn(
          "text-base sm:text-lg font-bold tracking-tight",
          isActive ? "text-cyan-400" : "text-white"
        )}>
          {title}
        </h3>
        <p className="text-zinc-400 text-xs sm:text-sm font-medium leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

export default TimelineItem;