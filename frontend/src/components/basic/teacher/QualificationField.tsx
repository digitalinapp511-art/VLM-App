import React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface QualificationFieldProps {
  label: string;
  icon: React.ReactNode;
  value: string;
  placeholder?: string;
  isSelect?: boolean;
  onChange?: (val: string) => void;
}

const QualificationField: React.FC<QualificationFieldProps> = ({
  label,
  icon,
  value,
  placeholder,
  isSelect = false,
  onChange,
}) => {
  return (
    <div className="space-y-2 w-full">
      <label className="text-zinc-400 text-sm font-medium ml-1">
        {label}
      </label>
      <div className={cn(
        "relative flex items-center h-14 w-full rounded-xl border border-white/10 bg-zinc-900/50 px-4 transition-all group",
        "focus-within:border-white/20 focus-within:bg-zinc-900"
      )}>
        <div className="text-blue-400/80 mr-3">
          {React.cloneElement(icon as React.ReactElement<any>, { size: 20 })}
        </div>

        <div className="flex-1 text-zinc-100 text-[15px]">
          {onChange ? (
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
          <ChevronDown className="text-yellow-500/80 w-5 h-5" />
        )}
      </div>
    </div>
  );
};

export default QualificationField;