import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { ChevronLeft, ArrowDownLeft, ArrowUpRight, Search, Loader2, X, Check } from "lucide-react";
import { useStudentWalletHistory } from "@/hooks/use-student";
import { cn } from "@/lib/utils";
import { studentApi } from "@/lib/student-api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function TransactionHistory() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<"all" | "failed" | "ai_credits" | "doubt_credits" | "points">("all");
  const [historySearch, setHistorySearch] = useState("");

  const { data: walletHistory, isLoading: isHistoryLoading } = useStudentWalletHistory();
  const [selectedTx, setSelectedTx] = useState<any | null>(null);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [ticketCreatedId, setTicketCreatedId] = useState<string | null>(null);
  const [copiedTxId, setCopiedTxId] = useState(false);

  const handleRaiseTicket = async (tx: any) => {
    if (!tx) return;
    setIsCreatingTicket(true);
    try {
      const payload = {
        category: 'payment',
        subject: 'Issue with Transaction ID: ' + tx.id,
        description: 'I need support with this transaction.\n\nTransaction Details:\n- Title: ' + tx.title + '\n- Category: ' + tx.type + '\n- Date: ' + (tx.time ? new Date(tx.time).toLocaleString("en-IN") : "—") + '\n- Value: ' + tx.change + '\n- ID: ' + tx.id
      };
      const res = await studentApi.createTicket(payload);
      setTicketCreatedId(res.data?._id || res.data?.id || 'Created');
      toast.success('Support ticket raised successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to raise support ticket');
    } finally {
      setIsCreatingTicket(false);
    }
  };

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
                    <div 
                      key={tx.id} 
                      onClick={() => { setSelectedTx(tx); setTicketCreatedId(null); setCopiedTxId(false); }}
                      className="flex items-center justify-between gap-4 p-4 px-4 sm:px-6 hover:bg-slate-50 dark:hover:bg-white/[0.02] cursor-pointer transition-colors"
                    >
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

        {/* ── TRANSACTION DETAIL MODAL ── */}
        {selectedTx && (
          <div className="fixed inset-0 z-[120] bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-sm p-6 rounded-[2rem] bg-white dark:bg-[#121026] text-slate-800 dark:text-white shadow-2xl flex flex-col gap-5 text-left border border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => setSelectedTx(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Transaction Details</h3>
                <div className="mt-3 flex items-center gap-3">
                  <div className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center text-lg",
                    selectedTx.type === "failed" 
                      ? "bg-rose-50 dark:bg-rose-950/20 text-rose-500" 
                      : "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500"
                  )}>
                    {selectedTx.type === "failed" ? "⚠️" : "✓"}
                  </div>
                  <div>
                    <h4 className="text-xs font-black leading-tight">{selectedTx.title}</h4>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 capitalize">{selectedTx.type}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 bg-slate-50 dark:bg-[#191535] p-4 rounded-2xl border border-slate-100 dark:border-slate-800/40 text-xs">
                <div className="flex justify-between">
                  <span className="font-bold text-slate-400 dark:text-slate-500">Amount / Change</span>
                  <span className={cn(
                    "font-black",
                    selectedTx.type === "failed" ? "text-rose-500" : "text-emerald-500"
                  )}>{selectedTx.change}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-bold text-slate-400 dark:text-slate-500">Date &amp; Time</span>
                  <span className="font-black text-slate-700 dark:text-slate-200">
                    {selectedTx.time ? new Date(selectedTx.time).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                  </span>
                </div>

                <div className="flex flex-col gap-1 pt-1 border-t border-slate-200/50 dark:border-slate-800/50">
                  <span className="font-bold text-slate-400 dark:text-slate-500">Transaction ID</span>
                  <div className="flex items-center justify-between gap-2 bg-white dark:bg-[#100c2a] px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="font-black text-[10px] font-mono text-slate-500 dark:text-slate-400 select-all truncate">{selectedTx.id}</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(selectedTx.id);
                        setCopiedTxId(true);
                        setTimeout(() => setCopiedTxId(false), 2000);
                      }}
                      className="text-violet-600 dark:text-violet-400 text-[10px] font-black cursor-pointer border-none bg-transparent hover:underline shrink-0"
                    >
                      {copiedTxId ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                {ticketCreatedId ? (
                  <div className="w-full py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-black text-center flex items-center justify-center gap-1.5 animate-in zoom-in-95 duration-200">
                    <Check size={14} /> Support Ticket Raised (ID: {ticketCreatedId.substring(0, 8)}...)
                  </div>
                ) : (
                  <Button
                    onClick={() => handleRaiseTicket(selectedTx)}
                    disabled={isCreatingTicket}
                    className="w-full h-11 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-400 text-white font-black text-xs border-none shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                  >
                    {isCreatingTicket ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Raising Ticket...
                      </>
                    ) : (
                      "Raise Support Ticket"
                    )}
                  </Button>
                )}
                <Button
                  onClick={() => setSelectedTx(null)}
                  variant="outline"
                  className="w-full h-11 rounded-2xl border-slate-200 dark:border-[#221c4e] bg-transparent text-slate-500 dark:text-slate-400 font-bold text-xs"
                >
                  Close Details
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
