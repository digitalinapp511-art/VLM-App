import React from "react";
import { Check, Settings, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const WithdrawalTimeline: React.FC = () => {
  const steps = [
    {
      id: 1,
      title: "1. Request Received",
      time: "Oct 25, 2024 • 10:10 AM",
      status: "completed",
      icon: <Check size={18} strokeWidth={3} />
    },
    {
      id: 2,
      title: "2. Processing (Current)",
      status: "active",
      icon: <Settings size={18} strokeWidth={2.5} />
    },
    {
      id: 3,
      title: "3. Transfer in Progress",
      status: "upcoming",
      badge: "upcoming",
      icon: <Landmark size={18} />
    }
  ];

  return (
    <div className="py-4 space-y-0 px-2">
      {steps.map((step, idx) => (
        <div key={step.id} className="flex gap-4 min-h-[70px]">
          <div className="flex flex-col items-center">
            <motion.div 
              animate={step.status === 'active' ? { rotate: 360 } : {}}
              transition={step.status === 'active' ? { duration: 4, repeat: Infinity, ease: "linear" } : {}}
              className={cn(
                "w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all duration-500",
                step.status === "completed" && "bg-cyan-400/10 border-cyan-400 text-cyan-400",
                step.status === "active" && "bg-zinc-950 border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]",
                step.status === "upcoming" && "bg-zinc-900 border-white/10 text-zinc-600"
              )}
            >
              {step.icon}
            </motion.div>
            {idx !== steps.length - 1 && (
              <div className={cn(
                "w-[2px] flex-1 my-1",
                step.status === "completed" ? "bg-cyan-400" : "bg-zinc-800"
              )} />
            )}
          </div>
          <div className="pt-1 flex-1">
            <div className="flex items-center gap-3">
              <h3 className={cn(
                "text-[15px] font-bold tracking-tight",
                step.status === "active" ? "text-cyan-400" : "text-zinc-100"
              )}>
                {step.title}
              </h3>
              {step.badge && (
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                  {step.badge}
                </span>
              )}
            </div>
            {step.time && (
              <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wide mt-0.5">
                {step.time}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default WithdrawalTimeline;