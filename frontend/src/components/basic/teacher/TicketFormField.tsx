import React from "react";
import { motion } from "framer-motion";
import { Pencil, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface TicketFormFieldProps {
  label: string;
  icon?: React.ReactNode;
  placeholder: string;
  helperText?: string;
  type?: "select" | "input" | "textarea";
  charCount?: string;
}

const TicketFormField: React.FC<TicketFormFieldProps> = ({
  label,
  icon,
  placeholder,
  helperText,
  type = "input",
  charCount,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-6 rounded-[28px] border border-white/5 bg-white/[0.02] backdrop-blur-md relative group transition-all duration-300",
        "hover:border-cyan-500/30"
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-bold text-zinc-100 tracking-tight">{label}</h3>
        <Pencil size={16} className="text-zinc-600 group-hover:text-cyan-400 transition-colors" />
      </div>

      <div className="relative">
        {type === "select" ? (
          <div className="flex items-center justify-between h-12 px-2 text-zinc-400">
            <div className="flex items-center gap-3">
              {icon && <div className="text-cyan-400">{icon}</div>}
              <span className="text-[15px] font-medium">{placeholder}</span>
            </div>
            <ChevronDown size={20} className="text-zinc-600" />
          </div>
        ) : type === "textarea" ? (
          <textarea
            placeholder={placeholder}
            className="w-full bg-transparent border-none text-zinc-300 placeholder:text-zinc-700 focus:ring-0 text-[15px] resize-none min-h-[100px]"
          />
        ) : (
          <input
            type="text"
            placeholder={placeholder}
            className="w-full bg-transparent border-none text-zinc-300 placeholder:text-zinc-700 focus:ring-0 text-[15px]"
          />
        )}
      </div>

      <div className="flex justify-between items-center mt-4">
        <p className="text-[11px] text-zinc-600 font-medium tracking-tight">
          {helperText}
        </p>
        {charCount && (
          <span className="text-[11px] font-mono text-zinc-700">
            {charCount}
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default TicketFormField;