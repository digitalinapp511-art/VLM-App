import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const SchedulingCalendar: React.FC = () => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dates = Array.from({ length: 30 }, (_, i) => i + 1);
  const nextMonthDates = [1, 2, 3, 4];
  
  return (
    <div className="p-5 md:p-8 rounded-[32px] border border-white/10 bg-[#1A1A1A]/40 backdrop-blur-xl h-full">
      <div className="flex items-center justify-between mb-8 px-1">
        <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
          <ChevronLeft className="text-zinc-500" size={20} />
        </button>
        <h3 className="text-lg font-bold text-white tracking-tight">November 2024</h3>
        <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
          <ChevronRight className="text-zinc-500" size={20} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-3 md:gap-y-4 text-center">
        {days.map((day) => (
          <span key={day} className="text-[10px] md:text-[11px] font-bold text-zinc-600 uppercase tracking-widest pb-2">
            {day}
          </span>
        ))}
        
        {dates.map((date) => {
          const isSelected = date === 25;
          const isHighlighted = [24, 30].includes(date);
          
          return (
            <div key={date} className="flex items-center justify-center aspect-square sm:h-12">
              <span className={cn(
                "w-9 h-8 md:w-11 md:h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all cursor-pointer",
                isSelected 
                  ? "bg-[#3b82f6] text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] border border-white/20" 
                  : isHighlighted 
                    ? "border border-cyan-500/40 bg-cyan-500/10 text-cyan-400" 
                    : "text-zinc-300 hover:bg-white/5"
              )}>
                {date}
              </span>
            </div>
          );
        })}

        {nextMonthDates.map((date) => (
          <div key={`next-${date}`} className="flex items-center justify-center h-10 opacity-20">
            <span className="text-zinc-500 text-sm font-bold">{date}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SchedulingCalendar;