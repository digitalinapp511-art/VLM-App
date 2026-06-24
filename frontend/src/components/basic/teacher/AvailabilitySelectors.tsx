import React from "react";
import { cn } from "@/lib/utils";

interface DaySelectorProps {
  days: string[];
  selectedDay: string;
  onSelect: (day: string) => void;
}

export const DaySelector: React.FC<DaySelectorProps> = ({ days, selectedDay, onSelect }) => {
  return (
    <div className="flex justify-between items-center w-full gap-2 overflow-x-auto no-scrollbar py-2">
      {days.map((day, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(day)}
          className={cn(
            "flex items-center justify-center min-w-[42px] h-[42px] rounded-xl border text-[13px] font-bold transition-all duration-300",
            day === selectedDay
              ? "border-blue-500 bg-blue-500/10 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]"
              : "border-white/10 bg-zinc-900/50 text-zinc-400 hover:border-white/20",
            day === "WED" && "px-4" // Match the wider WED in image
          )}
        >
          {day}
        </button>
      ))}
    </div>
  );
};

interface SubjectChipProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export const SubjectChip: React.FC<SubjectChipProps> = ({ label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-5 py-2 rounded-2xl border text-sm font-medium transition-all duration-300",
        isActive
          ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
          : "border-white/10 bg-zinc-900/50 text-zinc-400 hover:border-white/20"
      )}
    >
      {label}
    </button>
  );
};