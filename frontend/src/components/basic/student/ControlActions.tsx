import { Button } from "@base-ui/react";
import { cn } from "@/lib/utils";
export default function ControlAction({ icon, label, active, variant, onClick }: any) {
    const glowStyles = {
        cyan: active ? "border-[#00f2ff] shadow-[0_0_20px_rgba(0,242,255,0.4)] bg-cyan-400 text-black " : "border-white/90 text-white/80",
        red: "border-[#ff4d4d] bg-[#ff4d4d] shadow-[0_0_20px_rgba(255,77,77,0.4)] text-white",
    };

    return (
        <div className={cn("flex flex-col justify-center items-center space-y-3")}>
            <Button
                onClick={onClick}
                // variant="outline"
                // size="lg"
                className={cn(
                    "h-16 w-16  rounded-full border-2 flex flex-col justify-center items-center transition-all duration-300 ",
                    glowStyles[variant as keyof typeof glowStyles],

                )}
            >
                {icon}
            </Button>
            <span className={cn(
                "text-[10px] font-bold tracking-widest uppercase",
                variant === 'red' ? "text-[#ff4d4d]" : active ? "text-cyan-400" : "text-white/30"
            )}>
                {label}
            </span>
        </div>
    );
}