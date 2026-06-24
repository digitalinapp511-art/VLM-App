import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
interface ExperienceCounterProps {
  value: number;
  label: string;
  onIncrement: () => void;
  onDecrement: () => void;
}

const ExperienceCounter: React.FC<ExperienceCounterProps> = ({
  value,
  label,
  onIncrement,
  onDecrement,
}) => {
  return (
    <div className="flex-1 flex items-center justify-between h-14 px-4 rounded-2xl border border-white/10 bg-white/5 transition-all hover:border-white/20">
      <button 
        onClick={onDecrement}
        className="text-yellow-500/80 hover:text-yellow-500 transition-colors p-1"
      >
        <ChevronLeft size={18} strokeWidth={3} />
      </button>
      
      <div className="flex items-center gap-2">
        <span className="text-zinc-100 font-bold text-lg">{value}</span>
        <span className="text-zinc-400 text-sm font-medium">{label}</span>
      </div>

      <button 
        onClick={onIncrement}
        className="text-yellow-500/80 hover:text-yellow-500 transition-colors p-1"
      >
        <ChevronRight size={18} strokeWidth={3} />
      </button>
    </div>
  );
};

export default ExperienceCounter;