import React from "react";
import { cn } from "@/lib/utils";

interface BEdToggleProps {
  value: boolean;
  onChange: (val: boolean) => void;
}

const BEdToggle: React.FC<BEdToggleProps> = ({ value, onChange }) => {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="space-y-0.5">
        <h4 className="text-zinc-100 font-semibold text-[15px]">B.Ed Qualification</h4>
        <p className="text-zinc-400 text-xs">Do you have a B.Ed qualification?</p>
      </div>

      <div className="flex bg-black/40 p-1 rounded-full border border-white/5 w-32 h-10">
        <button
          onClick={() => onChange(true)}
          className={cn(
            "flex-1 rounded-full text-xs font-bold transition-all duration-300",
            value 
              ? "bg-gradient-to-r from-yellow-600 to-yellow-400 text-black shadow-lg" 
              : "text-zinc-500 hover:text-zinc-300"
          )}
        >
          YES
        </button>
        <button
          onClick={() => onChange(false)}
          className={cn(
            "flex-1 rounded-full text-xs font-bold transition-all duration-300",
            !value 
              ? "bg-zinc-800 text-white" 
              : "text-zinc-500 hover:text-zinc-300"
          )}
        >
          NO
        </button>
      </div>
    </div>
  );
};

export default BEdToggle;