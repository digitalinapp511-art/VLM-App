import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SchedulingCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

const SchedulingCalendar: React.FC<SchedulingCalendarProps> = ({ selectedDate, onSelectDate }) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const currentMonthName = selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="p-5 md:p-8 rounded-[32px] border border-white/10 bg-[#1A1A1A]/40 backdrop-blur-xl h-full">
      <div className="flex items-center justify-between mb-8 px-1">
        <button type="button" className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white">
          <ChevronLeft size={20} />
        </button>
        <h3 className="text-lg font-bold text-white tracking-tight">{currentMonthName}</h3>
        <button type="button" className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-3 md:gap-y-4 text-center">
        {days.map((day) => (
          <span key={day} className="text-[10px] md:text-[11px] font-bold text-zinc-600 uppercase tracking-widest pb-2">
            {day}
          </span>
        ))}
        
        {dates.map((date) => {
          const isSelected = selectedDate.getDate() === date;
          
          return (
            <div key={date} className="flex items-center justify-center aspect-square sm:h-12">
              <span
                onClick={() => {
                  const newD = new Date(selectedDate);
                  newD.setDate(date);
                  onSelectDate(newD);
                }}
                className={cn(
                  "w-9 h-8 md:w-11 md:h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all cursor-pointer",
                  isSelected 
                    ? "bg-[#3b82f6] text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] border border-white/20" 
                    : "text-zinc-300 hover:bg-white/5"
                )}
              >
                {date}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SchedulingCalendar;