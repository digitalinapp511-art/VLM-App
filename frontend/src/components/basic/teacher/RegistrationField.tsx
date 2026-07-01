// import React from "react";
// import { cn } from "@/lib/utils";
// import { ChevronDown } from "lucide-react";

// interface RegistrationFieldProps {
//   icon: React.ReactNode;
//   label: string;
//   placeholder?: string;
//   value?: string;
//   isSelect?: boolean;
//   className?: string;
//   iconColor?: string;
//   onChange?: React.ChangeEventHandler<HTMLInputElement>;
//   readOnly?: boolean;
// }

// const RegistrationField: React.FC<RegistrationFieldProps> = ({
//   icon,
//   label,
//   placeholder,
//   value,
//   isSelect = false,
//   className,
//   iconColor = "text-blue-400/80",
//   onChange,
//   readOnly = false,
// }) => {
//   return (
//     <div className={cn(
//       "flex items-center gap-3 p-3.5 rounded-2xl border border-white/10 bg-white/[0.03] transition-all hover:bg-white/[0.05]",
//       className
//     )}>
//       <div className={cn("flex-shrink-0", iconColor)}>
//         {React.cloneElement(icon as React.ReactElement<any>, { size: 18, strokeWidth: 1.5 })}
//       </div>
//       <div className="flex flex-1 flex-col overflow-hidden leading-tight">
//         <span className="text-[11px] font-bold text-zinc-100 uppercase tracking-tight">{label}</span>
//         <div className="flex items-center justify-between mt-0.5">
//           <input
//             type="text"
//             value={value ?? ""}
//             placeholder={placeholder}
//             onChange={onChange}
//             readOnly={readOnly || isSelect}
//             className={cn(
//               "bg-transparent border-none outline-none p-0 m-0 text-[14px] truncate w-full",
//               value ? "text-zinc-300" : "text-zinc-500 font-light",
//               isSelect ? "cursor-pointer" : ""
//             )}
//           />
//           {isSelect && <ChevronDown size={14} className="text-zinc-500" />}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RegistrationField;




import React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface RegistrationFieldProps {
  icon: React.ReactNode;
  label: string;
  placeholder?: string;
  value?: string;
  isSelect?: boolean;
  className?: string;
  iconColor?: string;
  readOnly?: boolean;
  type?: string;
  required?: boolean;
  error?: string;
  options?: {
    label: string;
    value: string;
  }[];
  onChange?: React.ChangeEventHandler<
    HTMLInputElement | HTMLSelectElement
  >;
}

const RegistrationField: React.FC<RegistrationFieldProps> = ({
  icon,
  label,
  placeholder,
  value,
  isSelect = false,
  className,
  iconColor = "text-blue-400/80",
  onChange,
  readOnly = false,
  type = "text",
  required = false,
  error = "",
  options = [],
}) => {
  return (
    <div className={cn("w-full flex flex-col gap-1", className)}>
      <div
        className={cn(
          "flex items-center gap-3 p-3.5 rounded-2xl border transition-all bg-white/[0.03] hover:bg-white/[0.05] w-full",
          error ? "border-red-500/50 bg-red-500/[0.02]" : "border-white/10"
        )}
      >
        <div className={cn("flex-shrink-0", iconColor)}>
          {React.cloneElement(icon as React.ReactElement<any>, {
            size: 18,
            strokeWidth: 1.5,
          })}
        </div>

        <div className="flex flex-1 flex-col overflow-hidden leading-tight">
          <span className="text-[11px] font-bold text-zinc-100 uppercase tracking-tight flex items-center gap-0.5">
            {label}
            {required && <span className="text-red-500 font-black text-xs inline-block ml-0.5">*</span>}
          </span>

          <div className="flex items-center justify-between mt-0.5">
            {isSelect ? (
              <select
                value={value ?? ""}
                onChange={onChange}
                className="bg-transparent border-none outline-none text-[14px] text-zinc-300 w-full"
              >
                <option value="" className="bg-zinc-950 text-white">Select {label}</option>

                {options.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    className="bg-zinc-950 text-white"
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={type}
                value={value ?? ""}
                placeholder={placeholder}
                onChange={onChange}
                readOnly={readOnly}
                className={cn(
                  "bg-transparent border-none outline-none p-0 m-0 text-[14px] w-full",
                  value
                    ? "text-zinc-300"
                    : "text-zinc-500 font-light"
                )}
              />
            )}

            {isSelect && (
              <ChevronDown
                size={14}
                className="text-zinc-500 ml-2 flex-shrink-0"
              />
            )}
          </div>
        </div>
      </div>
      {error && (
        <span className="text-[9px] font-bold text-red-400/90 ml-2 uppercase tracking-wide">
          {error}
        </span>
      )}
    </div>
  );
};

export default RegistrationField;