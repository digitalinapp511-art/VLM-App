import React from "react";
import { Star, ArrowDownCircle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransactionProps {
  title: string;
  date: string;
  amount: string;
  type: "credit" | "debit";
}

const TransactionItem: React.FC<TransactionProps> = ({ title, date, amount, type }) => {
  const isCredit = type === "credit";
  
  return (
    <div className="flex items-center gap-4 py-4 group cursor-pointer border-b border-white/5 last:border-0">
      <div className={cn(
        "w-12 h-12 rounded-full flex items-center justify-center border transition-transform group-active:scale-95",
        isCredit ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-rose-500/10 border-rose-500/20 text-rose-500"
      )}>
        {isCredit ? <Star size={22} /> : <ArrowDownCircle size={22} />}
      </div>

      <div className="flex-1 space-y-0.5">
        <h4 className="text-[15px] font-bold text-zinc-100">{title}</h4>
        <p className="text-[11px] font-medium text-zinc-500">{date} • Class Points</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className={cn("text-[14px] font-black tracking-tight", isCredit ? "text-cyan-400" : "text-rose-500")}>
            {isCredit ? "+" : "-"} {amount} {isCredit ? "pts" : ""}
          </p>
          {!isCredit && <p className="text-[9px] font-bold text-zinc-600 uppercase">withdrawn</p>}
        </div>
        <ChevronRight size={16} className="text-zinc-700" />
      </div>
    </div>
  );
};

export default TransactionItem;