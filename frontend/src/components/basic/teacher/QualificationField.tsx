import React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface QualificationFieldProps {
  label: string;
  icon: React.ReactNode;
  value: string;
  placeholder?: string;
  isSelect?: boolean;
  options?: string[];
  required?: boolean;
  error?: string;
  onChange?: (val: string) => void;
}

const QualificationField: React.FC<QualificationFieldProps> = ({
  label,
  icon,
  value,
  placeholder,
  isSelect = false,
  options = [],
  required = false,
  error = "",
  onChange,
}) => {
  return (
    <div className="space-y-1.5 w-full flex flex-col">
      <label className="text-zinc-400 text-sm font-medium ml-1 flex items-center gap-0.5">
        {label}
        {required && <span className="text-red-500 font-bold text-xs">*</span>}
      </label>
      <div className={cn(
        "relative flex items-center h-14 w-full rounded-xl border px-4 transition-all group",
        error 
          ? "border-red-500/50 bg-red-500/[0.02]" 
          : "border-white/10 bg-zinc-900/50 focus-within:border-white/20 focus-within:bg-zinc-900"
      )}>
        <div className="text-blue-400/80 mr-3 shrink-0">
          {React.cloneElement(icon as React.ReactElement<any>, { size: 20 })}
        </div>

        <div className="flex-1 text-zinc-100 text-[15px] relative">
          {isSelect && options.length > 0 ? (
            <select
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              className={cn(
                "w-full bg-transparent border-none outline-none text-[15px] appearance-none cursor-pointer pr-6 relative z-10",
                value ? "text-zinc-100" : "text-zinc-500"
              )}
            >
              <option value="" className="bg-zinc-950 text-zinc-500">Select {label}</option>
              {options.map((opt) => (
                <option key={opt} value={opt} className="bg-zinc-950 text-white">
                  {opt}
                </option>
              ))}
            </select>
          ) : onChange ? (
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-transparent border-none outline-none text-[15px] text-zinc-100"
            />
          ) : (
            value || <span className="text-zinc-500">{placeholder}</span>
          )}
        </div>

        {isSelect && (
          <ChevronDown className="text-yellow-500/80 w-5 h-5 absolute right-4 pointer-events-none z-0" />
        )}
      </div>
      {error && (
        <span className="text-[9px] font-bold text-red-400/90 ml-1 uppercase tracking-wide">
          {error}
        </span>
      )}
    </div>
  );
};

export default QualificationField;