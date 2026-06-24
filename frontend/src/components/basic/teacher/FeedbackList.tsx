import React from "react";
import { User } from "lucide-react";
import { motion } from "framer-motion";

interface FeedbackItem {
  type: "Feedback" | "Suggestion";
  text: string;
}

const FeedbackList: React.FC = () => {
  const feedbacks: FeedbackItem[] = [
    { type: "Feedback", text: "Great class! Found the analogies for optimization very clear." },
    { type: "Feedback", text: "The step-by-step breakdown of implicit differentiation was excellent." },
    { type: "Suggestion", text: "Spend a little more time on partial derivatives in the next session." },
  ];

  return (
    <div className="p-6 rounded-[32px] border border-white/5 bg-white/[0.02] backdrop-blur-xl space-y-6">
      <h3 className="text-center text-[13px] font-black text-zinc-100 uppercase tracking-[0.2em] border-b border-white/5 pb-4">
        Class Feedback & Insights
      </h3>
      
      <div className="space-y-6">
        {feedbacks.map((item, idx) => (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={idx} 
            className="flex gap-4 items-start"
          >
            <div className="w-10 h-10 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 shrink-0">
              <User size={20} />
            </div>
            <div className="space-y-1">
              <h4 className="text-[13px] font-bold text-zinc-200">{item.type}:</h4>
              <p className="text-[13px] text-zinc-400 font-medium leading-relaxed">
                {item.text}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FeedbackList;