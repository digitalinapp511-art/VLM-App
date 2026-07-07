import { Button } from "@base-ui/react";
import { cn } from "@/lib/utils";

export default function ControlAction({ icon, label, active, variant, onClick }: any) {
    const isRed = variant === "red";
    
    return (
        <div className="flex flex-col justify-center items-center space-y-2 shrink-0">
            <Button
                onClick={onClick}
                className={cn(
                    "h-14 w-14 rounded-full border-2 flex flex-col justify-center items-center transition-all duration-350 active:scale-90 cursor-pointer",
                    isRed
                      ? "border-rose-600 bg-rose-600 text-white shadow-md shadow-rose-500/20"
                      : active
                        ? "border-cyan-500 bg-cyan-500 text-white dark:border-cyan-400 dark:bg-cyan-400 dark:text-slate-950 shadow-md shadow-cyan-550/20"
                        : "border-slate-200 bg-slate-50 text-slate-450 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-500"
                )}
            >
                {icon}
            </Button>
            <span className={cn(
                "text-[9px] font-black tracking-widest uppercase",
                isRed 
                  ? "text-rose-650 dark:text-rose-500" 
                  : active 
                    ? "text-cyan-600 dark:text-cyan-400" 
                    : "text-slate-400 dark:text-slate-500"
            )}>
                {label}
            </span>
        </div>
    );
}