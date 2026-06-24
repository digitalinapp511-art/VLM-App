import React from "react";
import { Calculator, Orbit, FlaskConical, Book, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const SubjectSelector: React.FC = () => {
  const subjects = [
    { id: "maths", label: "MATHS", icon: <Calculator />, color: "cyan", selected: true },
    { id: "physics", label: "PHYSICS", icon: <Orbit />, color: "zinc" },
    { id: "chemistry", label: "CHEMISTRY", icon: <FlaskConical />, color: "zinc" },
    { id: "english", label: "ENGLISH", icon: <Book />, color: "zinc" },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-black text-white uppercase tracking-widest ml-1">
        Select Subject for Video
      </h3>
      <div className="grid grid-cols-4 gap-3">
        {subjects.map((sub) => (
          <button
            key={sub.id}
            className={cn(
              "relative flex flex-col items-center justify-center gap-3 p-4 aspect-square rounded-[22px] border transition-all duration-300",
              sub.selected 
                ? "border-cyan-400 bg-cyan-400/5 shadow-[0_0_15px_rgba(34,211,238,0.2)]" 
                : "border-white/10 bg-white/[0.02]"
            )}
          >
            {sub.selected && (
              <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-white rounded-full flex items-center justify-center z-10 border border-cyan-400">
                <Check size={10} className="text-cyan-600" strokeWidth={5} />
              </div>
            )}
            <div className={cn(sub.selected ? "text-cyan-400" : "text-zinc-500")}>
              {React.cloneElement(sub.icon as React.ReactElement<any>, { size: 24 })}
            </div>
            <span className={cn("text-[9px] font-black tracking-tighter", sub.selected ? "text-white" : "text-zinc-500")}>
              {sub.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SubjectSelector;