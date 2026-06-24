import React from "react";
import { motion } from "framer-motion";

const InterviewInstructionsCard: React.FC = () => {
  const instructions = [
    "Join from a quiet, professional setting.",
    "Ensure stable high-speed internet.",
    "Use headphones for best audio quality.",
    "Keep relevant documents accessible.",
    "Join 5-10 minutes early.",
    "Focus on clarity and teaching style.",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="p-6 rounded-[28px] border border-white/10 bg-white/[0.03] backdrop-blur-md"
    >
      <h3 className="text-base font-bold text-zinc-100 mb-4 border-b border-white/5 pb-3">
        Interview Instructions
      </h3>
      <ul className="space-y-2.5 px-2">
        {instructions.map((text, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-zinc-400 font-medium">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-zinc-700 shrink-0" />
            {text}
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

export default InterviewInstructionsCard;