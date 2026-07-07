import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { ChevronLeft, Wallet, ArrowUpRight, ArrowDownLeft, Plus, Zap, MessageSquare, Award, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useStudentProfile, useStudentWalletHistory } from "@/hooks/use-student";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { studentApi } from "@/lib/student-api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import StudentBottomNav from "@/features/student/components/layout/StudentBottomNav";

export default function StudentWallet() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isRecharging, setIsRecharging] = useState(false);
  const [activePackTab, setActivePackTab] = useState<"combo" | "ai" | "doubt">("combo");
  const [rechargeAmount, setRechargeAmount] = useState<number>(500); // Default to Recommended 500
  const [customAmountInput, setCustomAmountInput] = useState<string>("500");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  const { data: profile, isLoading: isProfileLoading } = useStudentProfile();
  const { data: walletHistory, isLoading: isHistoryLoading } = useStudentWalletHistory();

  const student = (profile as any)?.data || profile;

  // Get current wallet details from profile
  const wallet = student?.wallet || {
    totalPoints: 0,
    balance: 0,
    aiCredits: 0,
    humanChatCredits: 0,
  };

  const currentPoints = wallet.totalPoints || student?.totalPoints || 0;

  // Calculate dynamic outputs based on amount & selected category tab:
  const getDynamicPoints = (amount: number) => {
    return 0;
  };

  const getDynamicAiCredits = (amount: number) => {
    if (activePackTab === "combo") return Math.floor(amount * 5);
    if (activePackTab === "ai") return Math.floor(amount * 10);
    return 0;
  };

  const getDynamicDoubtCredits = (amount: number) => {
    if (activePackTab === "combo") return Math.floor(amount * 0.5);
    if (activePackTab === "doubt") return Math.floor(amount * 1);
    return 0;
  };

  const rechargeMutation = useMutation({
    mutationFn: studentApi.rechargeWallet,
    onSuccess: (res) => {
      toast.success("Wallet recharged successfully!");
      queryClient.invalidateQueries({ queryKey: ["studentProfile"] });
      queryClient.invalidateQueries({ queryKey: ["studentWalletHistory"] });
      setShowConfirmModal(false);
      setShowRechargeModal(false);
    },
    onError: () => {
      toast.error("Recharge failed. Please try again.");
    },
    onSettled: () => {
      setIsRecharging(false);
    }
  });

  const [usePointsRedemption, setUsePointsRedemption] = useState(false);

  // Points redemption calculation logic:
  // 10 points = ₹1.00
  // Can cover up to 25% of purchase cost.
  const maxDiscountInRupees = rechargeAmount * 0.25;
  const maxPointsNeeded = maxDiscountInRupees * 10;
  const pointsToRedeem = Math.min(currentPoints, maxPointsNeeded);
  const pointsValueDiscount = pointsToRedeem / 10;
  const finalPriceToPay = rechargeAmount - (usePointsRedemption ? pointsValueDiscount : 0);

  const handleConfirmRecharge = () => {
    setIsRecharging(true);
    // Simulate payment loading
    setTimeout(() => {
      rechargeMutation.mutate({
        amount: rechargeAmount,
        points: getDynamicPoints(rechargeAmount),
        aiCredits: getDynamicAiCredits(rechargeAmount),
        humanChatCredits: getDynamicDoubtCredits(rechargeAmount),
        redeemedPoints: usePointsRedemption ? pointsToRedeem : 0,
      });
    }, 1500);
  };

  return (
    <div className="relative flex min-h-svh w-full flex-col items-center bg-[#f4f6ff] dark:bg-[#0b081e] px-6 py-8 overflow-hidden text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <div className="max-w-xl w-full flex flex-col min-h-svh pb-24">
        
        {/* ── HEADER ── */}
        <header className="flex items-center justify-between pb-6 relative z-10">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-10 w-10 rounded-xl border-slate-200 dark:border-[#221c4e] bg-white dark:bg-[#161233] text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-95 transition-all shadow-sm"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft size={20} />
          </Button>
          <h1 className="text-md font-black tracking-tight uppercase">My Wallet</h1>
          <div className="w-10 h-10" />
        </header>

        {/* ── WALLET BALANCE CARD ── */}
        <div className="relative w-full rounded-[2.5rem] bg-gradient-to-tr from-violet-600 to-fuchsia-500 p-6 text-white shadow-xl overflow-hidden flex flex-col gap-6 select-none">
          {/* Decorative background shapes */}
          <div className="absolute top-0 right-0 h-40 w-40 bg-white/5 rounded-full blur-[30px] -mr-16 -mt-16 pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 h-32 w-32 bg-fuchsia-400/20 rounded-full blur-[40px] pointer-events-none" />

          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2 bg-white/10 rounded-full py-1 px-3 backdrop-blur-md">
              <Wallet size={16} />
              <span className="text-[10px] font-black uppercase tracking-wider">VLM Coins</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider bg-black/10 py-1 px-2.5 rounded-full">Active</span>
          </div>

          <div className="space-y-1 z-10 text-left">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/70 block">Total Balance</span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black tracking-tight">{currentPoints}</span>
              <span className="text-sm font-black text-white/80">PTS</span>
            </div>
            <span className="text-[10px] font-bold text-white/80 block mt-1">
              10 PTS = ₹1.00 (Value: ₹{(currentPoints / 10).toFixed(2)})
            </span>
          </div>

          {/* Sub-balances grid */}
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 border-t border-white/10 pt-4 z-10">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Zap size={16} className="text-amber-300 fill-amber-300" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[9px] font-black text-white/60 uppercase">AI Tutor Credits</span>
                  <span className="text-xs font-black">{wallet.aiCredits}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setActivePackTab("ai");
                  setUsePointsRedemption(false);
                  setShowRechargeModal(true);
                }}
                className="text-[9px] font-black uppercase bg-white/20 hover:bg-white/30 text-white px-2 py-1.5 rounded-lg transition-colors shrink-0"
              >
                + Top Up
              </button>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <MessageSquare size={16} className="text-cyan-300" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[9px] font-black text-white/60 uppercase">Doubt Credits</span>
                  <span className="text-xs font-black">{wallet.humanChatCredits}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setActivePackTab("doubt");
                  setUsePointsRedemption(false);
                  setShowRechargeModal(true);
                }}
                className="text-[9px] font-black uppercase bg-white/20 hover:bg-white/30 text-white px-2 py-1.5 rounded-lg transition-colors shrink-0"
              >
                + Top Up
              </button>
            </div>
          </div>
        </div>

        {/* Action Recharge Trigger Button on main page */}
        <button
          onClick={() => setShowRechargeModal(true)}
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-400 text-white font-black text-xs uppercase tracking-wider active:scale-[0.98] transition-all shadow-md shadow-violet-500/20 flex items-center justify-center gap-2 mt-6 cursor-pointer"
        >
          <Plus size={18} /> Recharge Wallet
        </button>

        {/* ── REFER & EARN BANNER ── */}
        <div 
          onClick={() => navigate(PATHS.REFER_EARN)}
          className="mt-6 w-full rounded-[2rem] bg-gradient-to-r from-fuchsia-600/10 to-violet-600/10 dark:from-fuchsia-600/20 dark:to-violet-600/20 border border-fuchsia-200 dark:border-fuchsia-900/30 p-5 flex items-center justify-between cursor-pointer hover:scale-[1.01] transition-all"
        >
          <div className="flex items-center gap-3 text-left">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-fuchsia-500 to-violet-600 flex items-center justify-center text-white shadow-sm">
              <Plus size={20} />
            </div>
            <div>
              <h4 className="text-xs font-black text-fuchsia-600 dark:text-fuchsia-400 uppercase tracking-wider">Refer & Earn</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-0.5 leading-snug">Invite friends to VLM Academy and earn 500 free points!</p>
            </div>
          </div>
          <ChevronLeft size={16} className="text-fuchsia-500 rotate-180" />
        </div>

        {/* ── TRANSACTION HISTORY ── */}
        <div className="space-y-4 mt-8">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Transaction History</h3>
          </div>

          {isHistoryLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-slate-400" size={24} />
            </div>
          ) : !walletHistory || walletHistory.length === 0 ? (
            <div className="text-center py-10 rounded-[2rem] border border-dashed border-slate-200 dark:border-[#221c4e]">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500">No transactions recorded yet.</p>
            </div>
          ) : (
            <div className="w-full rounded-[2.5rem] border border-slate-100 dark:border-[#221c4e] bg-white dark:bg-[#161233] divide-y divide-slate-50 dark:divide-[#221c4e] overflow-hidden shadow-sm transition-colors duration-300">
              {walletHistory.map((tx: any) => {
                const isDebit = tx.change?.startsWith("-") || tx.points < 0;
                return (
                  <div key={tx.id} className="flex items-center justify-between p-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-9 w-9 rounded-xl flex items-center justify-center shadow-sm",
                        isDebit 
                          ? "bg-rose-50 dark:bg-rose-950/20 text-rose-500" 
                          : "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500"
                      )}>
                        {isDebit ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-black text-slate-800 dark:text-slate-100">{tx.title}</span>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 capitalize">{tx.type}</span>
                      </div>
                    </div>
                    <span className={cn(
                      "text-xs font-black",
                      isDebit ? "text-rose-500" : "text-emerald-500"
                    )}>
                      {tx.change || `+${tx.points} PTS`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* ── RECHARGE POPUP MODAL ── */}
      {showRechargeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6 overflow-y-auto">
          <div className="relative w-full max-w-sm rounded-[2.5rem] border border-slate-100 dark:border-[#221c4e] bg-white dark:bg-[#161233] p-6 text-center shadow-2xl flex flex-col gap-4 text-slate-800 dark:text-slate-100 transition-colors duration-300 my-8">
            <h2 className="text-md font-black uppercase tracking-tight flex items-center justify-center gap-2">
              Recharge Balance
            </h2>

            {/* Sub-tabs inside popup */}
            <div className="flex border border-slate-200 dark:border-[#221c4e] rounded-xl p-1 bg-slate-50/50 dark:bg-slate-900/40">
              <button
                onClick={() => {
                  setActivePackTab("combo");
                  setUsePointsRedemption(false);
                }}
                className={cn(
                  "flex-1 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all",
                  activePackTab === "combo"
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                )}
              >
                Combo
              </button>
              <button
                onClick={() => {
                  setActivePackTab("ai");
                  setUsePointsRedemption(false);
                }}
                className={cn(
                  "flex-1 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all",
                  activePackTab === "ai"
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                )}
              >
                AI Top-up
              </button>
              <button
                onClick={() => {
                  setActivePackTab("doubt");
                  setUsePointsRedemption(false);
                }}
                className={cn(
                  "flex-1 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all",
                  activePackTab === "doubt"
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                )}
              >
                Doubt Top-up
              </button>
            </div>

            {/* Amount input & validations */}
            <div className="flex flex-col gap-1 text-left">
              <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Enter Amount (₹)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-sm font-black text-slate-400">₹</span>
                <input
                  type="number"
                  value={customAmountInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCustomAmountInput(val);
                    const parsed = parseFloat(val);
                    if (!isNaN(parsed)) {
                      setRechargeAmount(parsed);
                    } else {
                      setRechargeAmount(0);
                    }
                  }}
                  placeholder="Enter amount (100 - 10000)"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#221c4e] bg-slate-50/50 dark:bg-slate-900/40 text-xs font-black focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
              {rechargeAmount < 100 && (
                <span className="text-[9px] text-rose-500 font-bold block">
                  Minimum recharge amount is ₹100
                </span>
              )}
              {rechargeAmount > 10000 && (
                <span className="text-[9px] text-rose-500 font-bold block">
                  Maximum recharge amount is ₹10,000
                </span>
              )}
            </div>

            {/* Quick suggestions */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setCustomAmountInput("100");
                  setRechargeAmount(100);
                }}
                className={cn(
                  "flex-1 py-2 rounded-xl border text-[10px] font-black transition-all active:scale-[0.98]",
                  rechargeAmount === 100
                    ? "border-violet-500 bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400"
                    : "border-slate-200 dark:border-[#221c4e] text-slate-600 dark:text-slate-300"
                )}
              >
                ₹100
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setCustomAmountInput("500");
                  setRechargeAmount(500);
                }}
                className={cn(
                  "flex-1 py-2 rounded-xl border text-[10px] font-black transition-all active:scale-[0.98] relative",
                  rechargeAmount === 500
                    ? "border-violet-500 bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400"
                    : "border-slate-200 dark:border-[#221c4e] text-slate-600 dark:text-slate-300"
                )}
              >
                ₹500
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-rose-500 text-[6px] text-white px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider shadow-sm whitespace-nowrap">
                  Recommended
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCustomAmountInput("1000");
                  setRechargeAmount(1000);
                }}
                className={cn(
                  "flex-1 py-2 rounded-xl border text-[10px] font-black transition-all active:scale-[0.98]",
                  rechargeAmount === 1000
                    ? "border-violet-500 bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400"
                    : "border-slate-200 dark:border-[#221c4e] text-slate-600 dark:text-slate-300"
                )}
              >
                ₹1000
              </button>
            </div>

            {/* Expected benefits breakdown box */}
            {rechargeAmount >= 100 && rechargeAmount <= 10000 && (
              <div className="p-3 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800 rounded-xl space-y-1.5 text-left">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                  Expected benefits
                </span>

                {getDynamicAiCredits(rechargeAmount) > 0 && (
                  <div className="flex justify-between text-[11px]">
                    <span className="font-bold text-slate-500">AI Tutor Credits</span>
                    <span className="font-black text-amber-500">
                      +{getDynamicAiCredits(rechargeAmount)}
                    </span>
                  </div>
                )}
                {getDynamicDoubtCredits(rechargeAmount) > 0 && (
                  <div className="flex justify-between text-[11px]">
                    <span className="font-bold text-slate-500">Doubt Credits</span>
                    <span className="font-black text-cyan-500">
                      +{getDynamicDoubtCredits(rechargeAmount)}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 mt-2">
              <Button
                onClick={() => setShowRechargeModal(false)}
                variant="outline"
                className="flex-1 h-11 rounded-xl border-slate-200 dark:border-[#221c4e] bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowRechargeModal(false);
                  setShowConfirmModal(true);
                }}
                disabled={rechargeAmount < 100 || rechargeAmount > 10000}
                className="flex-1 h-11 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-400 text-white font-black text-xs border-none shadow-[0_0_15px_rgba(124,58,237,0.3)]"
              >
                Recharge ₹{rechargeAmount}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── CONFIRM RECHARGE POPUP ── */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
          <div className="relative w-full max-w-sm rounded-[2rem] border border-slate-100 dark:border-[#221c4e] bg-white dark:bg-[#161233] p-6 text-center shadow-2xl flex flex-col gap-5 text-slate-800 dark:text-slate-100 transition-colors duration-300">
            <h2 className="text-lg font-black tracking-tight flex items-center justify-center gap-2">
              Confirm Purchase
            </h2>

            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium px-4 leading-relaxed">
              Are you sure you want to recharge your wallet with <span className="font-extrabold text-slate-800 dark:text-white">₹{rechargeAmount}</span>?
            </p>

            {/* Points discount checkbox selector */}
            {pointsToRedeem > 0 && (
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-left">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-black text-violet-600 dark:text-violet-400 uppercase">Redeem Points (Max 25%)</span>
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold">Use {pointsToRedeem} PTS to get ₹{pointsValueDiscount.toFixed(2)} off</span>
                </div>
                <input
                  type="checkbox"
                  checked={usePointsRedemption}
                  onChange={(e) => setUsePointsRedemption(e.target.checked)}
                  className="h-4.5 w-4.5 rounded border-slate-300 text-violet-600 focus:ring-violet-500 cursor-pointer accent-violet-600"
                />
              </div>
            )}

            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex flex-col gap-2 text-left">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-400 dark:text-slate-500">Package Cost</span>
                <span className="font-black text-slate-800 dark:text-white">₹{rechargeAmount}</span>
              </div>
              
              {usePointsRedemption && (
                <div className="flex justify-between text-xs text-emerald-500">
                  <span>Points Discount (25%)</span>
                  <span>-₹{pointsValueDiscount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-xs border-t border-slate-100 dark:border-slate-800 pt-2">
                <span className="font-bold text-slate-400 dark:text-slate-500">Real Money Payable</span>
                <span className="font-black text-slate-800 dark:text-white">₹{finalPriceToPay.toFixed(2)}</span>
              </div>
              

              {getDynamicAiCredits(rechargeAmount) > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-400 dark:text-slate-500">AI Tutor Credits</span>
                  <span className="font-black text-slate-800 dark:text-white">+{getDynamicAiCredits(rechargeAmount)}</span>
                </div>
              )}
              {getDynamicDoubtCredits(rechargeAmount) > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-400 dark:text-slate-500">Doubt Credits</span>
                  <span className="font-black text-slate-800 dark:text-white">+{getDynamicDoubtCredits(rechargeAmount)}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-2">
              <Button
                onClick={() => {
                  setShowConfirmModal(false);
                  setShowRechargeModal(true); // Return to input modal
                }}
                variant="outline"
                disabled={isRecharging}
                className="flex-1 h-11 rounded-xl border-slate-200 dark:border-[#221c4e] bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmRecharge}
                disabled={isRecharging}
                className="flex-1 h-11 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-400 text-white font-black text-xs border-none shadow-[0_0_15px_rgba(124,58,237,0.3)] flex items-center justify-center gap-1.5"
              >
                {isRecharging ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Processing...
                  </>
                ) : (
                  "Pay ₹" + finalPriceToPay.toFixed(2)
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      <StudentBottomNav />
    </div>
  );
}
