import React from "react";
import { Info } from "lucide-react";
import { motion } from "framer-motion";

const InstructionsCard: React.FC = () => {
  const instructions = [
    "Solve one representative question from your subject.",
    "Clearly explain your teaching methodology and reasoning.",
    "Ensure high audio and video quality.",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-md"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
          <Info size={18} />
        </div>
        <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-widest">
          Instructions:
        </h3>
      </div>
      <div className="space-y-2 px-1">
        <p className="text-zinc-400 text-xs font-medium">To verify your teaching style, please:</p>
        <ul className="space-y-1.5">
          {instructions.map((text, i) => (
            <li key={i} className="flex items-start gap-2 text-[12px] text-zinc-400 leading-relaxed">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-zinc-600 shrink-0" />
              {text}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

export default InstructionsCard;