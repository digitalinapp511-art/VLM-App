import React from "react";
import { motion } from "framer-motion";

interface TimeUnitProps {
  value: string;
  label: string;
}

const TimeUnit: React.FC<TimeUnitProps> = ({ value, label }) => (
  <div className="flex flex-col items-center gap-2">
    <span className="text-4xl font-black text-white tracking-tighter">{value}</span>
    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{label}</span>
  </div>
);

const ReapplicationCountdown: React.FC = () => {
  return (
    <div className="py-10 space-y-6">
      <h3 className="text-center text-xs font-black text-zinc-100 uppercase tracking-[0.2em]">
        Reapplication Countdown:
      </h3>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center gap-6"
      >
        <TimeUnit value="06" label="Days" />
        <span className="text-zinc-700 text-2xl font-bold pb-6">:</span>
        <TimeUnit value="23" label="Hours" />
        <span className="text-zinc-700 text-2xl font-bold pb-6">:</span>
        <TimeUnit value="59" label="Minutes" />
        <span className="text-zinc-700 text-2xl font-bold pb-6">:</span>
        <TimeUnit value="55" label="Seconds" />
      </motion.div>
    </div>
  );
};

export default ReapplicationCountdown;