import React from "react";
import { PenTool, Pencil, Eraser, Undo2, Redo2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";

const WhiteboardToolbar: React.FC = () => {
  const colors = [
    { name: "black", class: "bg-[#1e293b]" },
    { name: "red", class: "bg-[#ef4444]" },
    { name: "blue", class: "bg-[#3b82f6]" },
    { name: "green", class: "bg-[#22c55e]" },
    { name: "yellow", class: "bg-[#eab308]" },
  ];

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/95 backdrop-blur-lg rounded-[2.5rem] shadow-2xl border border-zinc-200 p-3 flex flex-col gap-4 items-center"
    >
      <div className="flex items-center justify-around w-full px-2">
        <button className="p-3 rounded-xl bg-blue-100 text-blue-600 shadow-sm">
          <PenTool size={22} />
        </button>
        <button className="p-3 rounded-xl text-zinc-400 hover:bg-zinc-50 transition-colors">
          <Pencil size={22} />
        </button>
        <button className="p-3 rounded-xl text-zinc-400 hover:bg-zinc-50 transition-colors">
          <Eraser size={22} />
        </button>
        
        <Separator orientation="vertical" className="h-8 mx-1 bg-zinc-200" />
        
        <button className="p-3 rounded-xl text-zinc-400 hover:bg-zinc-50 transition-colors">
          <Undo2 size={22} />
        </button>
        <button className="p-3 rounded-xl text-zinc-400 hover:bg-zinc-50 transition-colors">
          <Redo2 size={22} />
        </button>
      </div>

      <div className="flex items-center gap-5 pb-1">
        {colors.map((color) => (
          <button
            key={color.name}
            className={cn(
              "w-6 h-6 rounded-full transition-transform active:scale-90",
              color.class,
              color.name === "black" && "ring-4 ring-zinc-200"
            )}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default WhiteboardToolbar;