import React from "react";
import { Button } from "@/components/ui/button";

interface FAQItemProps {
  question: string;
  description: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, description }) => {
  return (
    <div className="py-5 border-b border-white/5 last:border-0 flex items-center justify-between gap-4">
      <div className="flex-1 space-y-1">
        <h4 className="text-[15px] font-bold text-zinc-100 leading-snug">
          {question}
        </h4>
        <p className="text-[12px] text-zinc-500 font-medium line-clamp-1 italic">
          {description}
        </p>
      </div>
      <Button 
        variant="outline" 
        size="sm"
        className="rounded-full h-10 px-5 border-cyan-400/50 bg-cyan-400/5 text-cyan-400 text-[11px] font-bold uppercase hover:bg-cyan-400/10 transition-all shadow-[0_0_15px_rgba(34,211,238,0.1)]"
      >
        View Article
      </Button>
    </div>
  );
};

export default FAQItem;