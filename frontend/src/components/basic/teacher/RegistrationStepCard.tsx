import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface RegistrationStepCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconColor?: string;
  active?: boolean;
}

const RegistrationStepCard: React.FC<RegistrationStepCardProps> = ({
  icon,
  title,
  description,
  iconColor = "bg-white/10",
  active = false,
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl border transition-all duration-200",
        "bg-white/5 border-white/10 backdrop-blur-md hover:bg-white/10 hover:border-white/20",
        active && "border-blue-500/40 bg-blue-500/10"
      )}
    >
      <div className={cn("flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white/90 shadow-inner", iconColor)}>
        {React.cloneElement(icon as React.ReactElement<any>, { size: 18 })}
      </div>
      
      <div className="flex flex-1 items-center justify-between gap-2 overflow-hidden">
        <h3 className="text-zinc-100 font-medium text-[13px] whitespace-nowrap">
          {title}
        </h3>
        <span className="text-zinc-400 text-[12px] font-light truncate">
          {description}
        </span>
      </div>
    </motion.div>
  );
};

export default RegistrationStepCard;