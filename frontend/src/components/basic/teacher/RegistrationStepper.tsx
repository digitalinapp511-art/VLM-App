import React from "react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  label: string;
}

interface RegistrationStepperProps {
  currentStep: number;
}

const steps: Step[] = [
  { id: 1, label: "Basic Info" },
  { id: 2, label: "Experience" },
  { id: 3, label: "Subjects" },
  { id: 4, label: "Classes" },
  { id: 5, label: "Board" },
  { id: 6, label: "Language" },
  { id: 7, label: "Documents" },

];

const RegistrationStepper: React.FC<RegistrationStepperProps> = ({ currentStep }) => {
  return (
    <div className="w-full py-6 px-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="relative flex justify-between items-start min-w-[500px] md:min-w-full px-2">
        {/* Progress Line */}
        <div className="absolute top-[17px] left-8 right-8 h-[2px] bg-zinc-800 z-0">
          <div 
            className="h-full bg-blue-500 transition-all duration-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }} 
          />
        </div>
        {steps.map((step) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
              <div
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300",
                  isActive 
                    ? "bg-blue-600 text-white ring-4 ring-blue-600/20 shadow-[0_0_15px_rgba(37,99,235,0.5)]" 
                    : isCompleted 
                    ? "bg-[#0f172a] text-blue-400 border border-blue-500/30" 
                    : "bg-zinc-900 text-zinc-500 border border-white/5"
                )}
              >
                {step.id}
              </div>
              <span className={cn(
                "text-[10px] font-medium whitespace-nowrap uppercase tracking-wider",
                isActive ? "text-blue-400" : "text-zinc-500"
              )}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RegistrationStepper;