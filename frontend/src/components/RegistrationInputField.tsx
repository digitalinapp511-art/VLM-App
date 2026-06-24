import React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface RegistrationInputFieldProps {
  icon: React.ReactNode;
  label: string;
  placeholder?: string;
  value?: string;
  isSelect?: boolean;
  className?: string;
  iconColor?: string;
}

const RegistrationInputField: React.FC<RegistrationInputFieldProps> = ({
  icon,
  label,
  placeholder,
  value,
  isSelect = false,
  className,
  iconColor = "text-blue-400"
}) => {
  return (
    <div className={cn(
      "flex items-center gap-4 p-4 rounded-[22px] border border-white/10 bg-white/[0.03] transition-all hover:bg-white/[0.05]",
      className
    )}>
      <div className={cn("flex-shrink-0", iconColor)}>
        {React.cloneElement(icon as React.ReactElement<any>, { size: 20, strokeWidth: 1.5 })}
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <span className="text-[12px] font-bold text-zinc-100">{label}</span>
        <div className="flex items-center justify-between">
          <span className={cn(
            "text-[14px] truncate",
            value ? "text-zinc-200" : "text-zinc-500"
          )}>
            {value || placeholder}
          </span>
          {isSelect && <ChevronDown size={16} className="text-zinc-500" />}
        </div>
      </div>
    </div>
  );
};

export default RegistrationInputField;