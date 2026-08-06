import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { ChevronLeft, ArrowDownLeft, ArrowUpRight, Search, Loader2 } from "lucide-react";
import { useStudentWalletHistory } from "@/hooks/use-student";
import { cn } from "@/lib/utils";

export default function TransactionHistory() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<"all" | "failed" | "ai_credits" | "doubt_credits" | "points">("all");
  const [historySearch, setHistorySearch] = useState("");

  const { data: walletHistory, isLoading: isHistoryLoading } = useStudentWalletHistory();

  return (
    <div className="relative min-h-svh w-full bg-[#f4f6ff] dark:bg-[#0b081e] text-slate-800 dark:text-slate-100 flex flex-col items-center px-6 pt-8 pb-32 font-sans transition-colors duration-300">
      
      {/* Background Decor */}
      <div className="absolute top-[8%] left-[-10%] h-64 w-64 bg-purple-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] h-64 w-64 bg-cyan-600/5 blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full flex flex-col gap-6 relative z-10">
        
        {/* ── HEADER ── */}
        <header className="flex w-full items-center gap-4 pb-2 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <button 
            onClick={() => navigate(-1)}
            className="h-10 w-10 rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white active:scale-90 transition-transform cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>
          
          <h1 className="text-sm font-black tracking-tight text-slate-850 dark:text-slate-105">
            Transaction History
          </h1>
        </header>

        {/* ── SEARCH BAR ── */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by title, type, change..."
            value={historySearch}
            onChange={(e) => setHistorySearch(e.target.value)}
            className="bg-white dark:bg-[#161233] border border-slate-150 dark:border-[#221c4e] rounded-2xl h-12 pl-11 pr-4 w-full text-xs font-bold text-slate-800 dark:text-white outline-none focus-within:border-violet-500/50 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* ── FILTER CHIPS ── */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {(["all", "failed", "ai_credits", "doubt_credits", "points"] as const).map((filter) => {
            const labelMap = {
              all: "All",
              failed: "Failed",
              ai_credits: "AI Credits",
              doubt_credits: "Doubt Credits",
              points: "Points",
            };
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "px-4 py-2 rounded-full text-xs font-black whitespace-nowrap transition-all duration-200 active:scale-95 border cursor-pointer",
                  isActive
                    ? "bg-violet-600 border-violet-650 text-white shadow-sm"
                    : "bg-white dark:bg-[#161233] border-slate-100 dark:border-[#221c4e] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                {labelMap[filter]}
              </button>
            );
          })}
        </div>

        {/* ── TRANSACTIONS LIST ── */}
        <div>
          {isHistoryLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-slate-400" size={28} />
            </div>
          ) : (() => {
            const list = walletHistory as any[];
            const filteredList = list ? list.filter((tx) => {
              // 1. Search Query
              if (historySearch) {
                const query = historySearch.toLowerCase();
                const titleMatch = tx.title?.toLowerCase().includes(query);
                const changeMatch = tx.change?.toLowerCase().includes(query);
                const typeMatch = tx.type?.toLowerCase().includes(query);
                if (!titleMatch && !changeMatch && !typeMatch) return false;
              }

              // 2. Category Filter
              if (activeFilter === "failed") {
                return tx.type === "failed" || tx.title?.toLowerCase().includes("failed") || tx.title?.toLowerCase().includes("abandoned");
              }
              if (activeFilter === "ai_credits") {
                return tx.type === "ai_credits" || tx.change?.includes("AI");
              }
              if (activeFilter === "doubt_credits") {
                return tx.type === "doubt_credits" || tx.change?.includes("Doubt");
              }
              if (activeFilter === "points") {
                return tx.points !== 0 || tx.change?.includes("PTS");
              }
              return true;
            }) : [];

            if (filteredList.length === 0) {
              return (
                <div className="text-center py-20 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-[#221c4e] bg-white/50 dark:bg-white/5">
                  <p className="text-xs font-bold text-slate-400">No matching transactions found.</p>
                </div>
              );
            }

            return (
              <div className="w-full rounded-[2.5rem] border border-slate-100 dark:border-[#221c4e] bg-white dark:bg-[#161233] divide-y divide-slate-50 dark:divide-[#221c4e] overflow-hidden shadow-sm transition-colors duration-300">
                {filteredList.map((tx: any) => {
                  const isDebit = tx.change?.startsWith("-") || tx.points < 0;
                  const isFailed = tx.type === "failed";
                  return (
                    <div key={tx.id} className="flex items-center justify-between gap-4 p-4 px-4 sm:px-6 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={cn(
                          "h-9 w-9 rounded-xl flex items-center justify-center shadow-sm shrink-0",
                          isFailed
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-400"
                            : isDebit 
                            ? "bg-rose-50 dark:bg-rose-950/20 text-rose-500" 
                            : "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500"
                        )}>
                          {isFailed ? "⚠️" : isDebit ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                        </div>
                        <div className="flex flex-col text-left flex-1 min-w-0">
                          <span className={cn(
                            "text-xs font-black text-slate-800 dark:text-slate-100 truncate block",
                            isFailed && "line-through opacity-60"
                          )}>{tx.title}</span>
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 capitalize">{tx.type}</span>
                        </div>
                      </div>
                      <span className={cn(
                        "text-xs font-black shrink-0 text-right whitespace-nowrap",
                        isFailed ? "text-slate-400" : isDebit ? "text-rose-500" : "text-emerald-500"
                      )}>
                        {tx.change || `+${tx.points} PTS`}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

      </div>
    </div>
  );
}
