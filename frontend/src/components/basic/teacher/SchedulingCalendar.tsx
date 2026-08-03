import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SchedulingCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

const SchedulingCalendar: React.FC<SchedulingCalendarProps> = ({ selectedDate, onSelectDate }) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  // Track the current viewed month/year using a Date object
  const [viewDate, setViewDate] = useState<Date>(
    new Date(selectedDate ? selectedDate.getFullYear() : new Date().getFullYear(), selectedDate ? selectedDate.getMonth() : new Date().getMonth(), 1)
  );

  const currentMonthName = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // First day of the month (0 = Sunday, 1 = Monday, etc.)
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Generate blank spots before the first day of the month
  const blanks = Array.from({ length: firstDayIndex }, (_, i) => null);
  const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const calendarCells = [...blanks, ...dates];

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const handlePrevMonth = () => {
    const prevMonthDate = new Date(year, month - 1, 1);
    const minViewDate = new Date(today.getFullYear(), today.getMonth(), 1);
    if (prevMonthDate >= minViewDate) {
      setViewDate(prevMonthDate);
    }
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const isPrevDisabled = new Date(year, month - 1, 1) < new Date(today.getFullYear(), today.getMonth(), 1);

  return (
    <div className="p-5 md:p-8 rounded-[32px] border border-white/10 bg-[#1A1A1A]/40 backdrop-blur-xl h-full">
      <div className="flex items-center justify-between mb-8 px-1">
        <button 
          type="button" 
          onClick={handlePrevMonth}
          disabled={isPrevDisabled}
          className={cn(
            "p-2 rounded-full transition-colors text-zinc-400 hover:text-white",
            isPrevDisabled ? "opacity-20 cursor-not-allowed pointer-events-none" : "hover:bg-white/5 cursor-pointer"
          )}
        >
          <ChevronLeft size={20} />
        </button>
        <h3 className="text-lg font-bold text-white tracking-tight">{currentMonthName}</h3>
        <button 
          type="button" 
          onClick={handleNextMonth}
          className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white cursor-pointer"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-3 md:gap-y-4 text-center">
        {days.map((day) => (
          <span key={day} className="text-[10px] md:text-[11px] font-bold text-zinc-600 uppercase tracking-widest pb-2">
            {day}
          </span>
        ))}
        
        {calendarCells.map((date, idx) => {
          if (date === null) {
            return <div key={`blank-${idx}`} className="flex items-center justify-center aspect-square sm:h-12" />;
          }

          const cellDate = new Date(year, month, date);
          const isPast = cellDate < todayStart;

          const isSelected = selectedDate && 
                             selectedDate.getFullYear() === year && 
                             selectedDate.getMonth() === month && 
                             selectedDate.getDate() === date;
          
          return (
            <div key={`date-${date}`} className="flex items-center justify-center aspect-square sm:h-12">
              <span
                onClick={() => {
                  if (isPast) return;
                  const newD = new Date(year, month, date);
                  onSelectDate(newD);
                }}
                className={cn(
                  "w-9 h-8 md:w-11 md:h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all",
                  isPast 
                    ? "text-zinc-700 opacity-20 cursor-not-allowed pointer-events-none"
                    : isSelected 
                      ? "bg-[#3b82f6] text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] border border-white/20 cursor-pointer" 
                      : "text-zinc-300 hover:bg-white/5 cursor-pointer"
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