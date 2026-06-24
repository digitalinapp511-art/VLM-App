import React from "react";
import { Check, PencilLine } from "lucide-react";
import { cn } from "@/lib/utils";

const TimeSlotGrid: React.FC = () => {
  const slots = [
    { time: "9:00 AM", status: "active" },
    { time: "10:00 AM", status: "selected" },
    { time: "11:30 AM", status: "disabled" },
    { time: "1:00 PM", status: "active" },
    { time: "2:30 PM", status: "disabled" },
    { time: "4:00 PM", status: "active" },
    { time: "4:30 PM", status: "active" },
    { time: "5:30 PM", status: "active" },
  ];

  return (
    <div className="p-6 md:p-8 rounded-[32px] border border-white/10 bg-[#1A1A1A]/40 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-8">
        <h4 className="text-lg font-bold text-white tracking-tight">Available Time Slots</h4>
        <PencilLine className="text-zinc-500 cursor-pointer hover:text-zinc-300" size={20} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
        {slots.map((slot, index) => {
          const isSelected = slot.status === "selected";
          return (
            <button
              key={index}
              disabled={slot.status === "disabled"}
              className={cn(
                "relative h-14 rounded-2xl border transition-all flex items-center justify-center",
                slot.status === "disabled" 
                  ? "bg-zinc-900/40 border-white/5 text-zinc-700 opacity-50 cursor-not-allowed" 
                  : "bg-white/[0.03] border-white/10 text-zinc-300 hover:bg-white/[0.08]",
                isSelected && "border-[#22d3ee] bg-[#22d3ee]/10 text-[#22d3ee] shadow-[0_0_20px_rgba(34,211,238,0.2)]"
              )}
            >
              <span className="text-sm font-bold">{slot.time}</span>
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-[#22d3ee] rounded-full flex items-center justify-center border-2 border-[#1A1A1A]">
                  <Check className="text-black w-3 h-3" strokeWidth={4} />
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      <p className="text-[12px] text-zinc-600 mt-8 font-medium italic">
        * Note: Slots are displayed in your local timezone.
      </p>
    </div>
  );
};

export default TimeSlotGrid;