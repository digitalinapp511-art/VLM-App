import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { ChevronLeft, Wallet, ArrowUpRight, ArrowDownLeft, Plus, Zap, MessageSquare, Award, Loader2, Search, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useStudentProfile, useStudentWalletHistory } from "@/hooks/use-student";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { studentApi } from "@/lib/student-api";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import StudentBottomNav from "@/features/student/components/layout/StudentBottomNav";
import { loadRazorpayScript, openRazorpayCheckout } from "@/lib/razorpay";

export default function StudentWallet() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isRecharging, setIsRecharging] = useState(false);
  const [activePackTab, setActivePackTab] = useState<"combo" | "ai" | "doubt">("combo");
  const [rechargeAmount, setRechargeAmount] = useState<number>(5000); // Default to Fallback 5000
  const [customAmountInput, setCustomAmountInput] = useState<string>("5000");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  const [activeFilter, setActiveFilter] = useState<"all" | "failed" | "ai_credits" | "doubt_credits" | "points">("all");
  const [historySearch, setHistorySearch] = useState("");
  const [showFullHistoryModal, setShowFullHistoryModal] = useState(false);

  // Admin cashback edit states
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [selectedAdminAmt, setSelectedAdminAmt] = useState<number>(0);
  const [adminBonusPercent, setAdminBonusPercent] = useState<number>(0);
  const [adminTag, setAdminTag] = useState<string>("");
  const [adminOfferId, setAdminOfferId] = useState<string | null>(null);
  const [adminIsActive, setAdminIsActive] = useState<boolean>(true);
  const [savingAdmin, setSavingAdmin] = useState(false);

  const { data: profile, isLoading: isProfileLoading } = useStudentProfile();
  const { data: walletHistory, isLoading: isHistoryLoading } = useStudentWalletHistory();

  const { data: cashbackResponse } = useQuery({
    queryKey: ["activeCashbackOffers"],
    queryFn: studentApi.getActiveCashbackOffers,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const cashbackOffers = cashbackResponse?.data || [];

  useEffect(() => {
    const activeOffers = cashbackOffers.filter((o: any) => o.isActive);
    if (activeOffers.length > 0) {
      // Prefer recommended offer; fallback to lowest amount
      const recommended = activeOffers.find((o: any) => o.isRecommended);
      const firstOffer = recommended ||
        [...activeOffers].sort((a: any, b: any) => a.minRechargeAmount - b.minRechargeAmount)[0];
      const firstAmt = firstOffer.minRechargeAmount;
      const firstType = firstOffer.rechargeType || 'combo';
      setActivePackTab(firstType as "combo" | "ai" | "doubt");
      setRechargeAmount(firstAmt);
      setCustomAmountInput(String(firstAmt));
    } else {
      setRechargeAmount(5000);
      setCustomAmountInput("5000");
    }
  }, [cashbackResponse]);

  const student = (profile as any)?.data || profile;

  // Get current wallet details from profile
  const wallet = student?.wallet || {
    totalPoints: 0,
    balance: 0,
    aiCredits: 0,
    humanChatCredits: 0,
  };

  const userRole = localStorage.getItem("vlm_role") || student?.role;
  const showAdminTools = userRole === "admin";

  const handleSaveAdminBonus = async () => {
    setSavingAdmin(true);
    try {
      const payload = {
        title: `Recharge ₹${selectedAdminAmt} Bonus`,
        description: `${adminBonusPercent}% bonus cashback on ₹${selectedAdminAmt} recharge`,
        recommendedText: adminTag,
        minRechargeAmount: selectedAdminAmt,
        cashbackPercent: adminBonusPercent,
        isActive: adminIsActive,
        rechargeType: activePackTab,
      };

      let res;
      if (adminOfferId) {
        res = await apiClient.put(`/admin/cashback-offers/${adminOfferId}`, payload);
      } else {
        res = await apiClient.post("/admin/cashback-offers", payload);
      }

      if (res.data?.success) {
        toast.success("Bonus offer saved successfully!");
        queryClient.invalidateQueries({ queryKey: ["activeCashbackOffers"] });
        setShowAdminModal(false);
      } else {
        toast.error(res.data?.message || "Failed to save offer");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to save bonus offer");
    } finally {
      setSavingAdmin(false);
    }
  };

  const currentPoints = wallet.totalPoints || student?.totalPoints || 0;

  // Calculate dynamic outputs based on amount & selected category tab:
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


  const [usePointsRedemption, setUsePointsRedemption] = useState(false);

  // Points redemption calculation logic:
  // 10 points = ₹1.00
  // Can cover up to 25% of purchase cost.
  const maxDiscountInRupees = rechargeAmount * 0.25;
  const maxPointsNeeded = maxDiscountInRupees * 10;
  const pointsToRedeem = Math.min(currentPoints, maxPointsNeeded);
  const pointsValueDiscount = pointsToRedeem / 10;
  const finalPriceToPay = rechargeAmount - (usePointsRedemption ? pointsValueDiscount : 0);

  const handleConfirmRecharge = async () => {
    setIsRecharging(true);
    try {
      // Step 1: Load Razorpay SDK
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) {
        toast.error("Payment SDK failed to load. Please check your internet connection.");
        setIsRecharging(false);
        return;
      }

      // Step 2: Create Razorpay order on backend
      const orderRes = await studentApi.createWalletOrder({
        amount: finalPriceToPay,
        aiCredits: getDynamicAiCredits(rechargeAmount),
        humanChatCredits: getDynamicDoubtCredits(rechargeAmount),
        redeemedPoints: usePointsRedemption ? pointsToRedeem : 0,
      });

      if (!orderRes?.success) {
        toast.error(orderRes?.message || "Failed to create payment order. Try again.");
        setIsRecharging(false);
        return;
      }

      const { orderId, amount, currency, keyId } = orderRes.data;

      // Step 3: Open Razorpay checkout
      const student = (profile as any)?.data || profile;
      const result = await openRazorpayCheckout({
        orderId,
        amount,
        currency,
        keyId,
        name: "VLM Academy",
        description: `Wallet Recharge — ₹${finalPriceToPay}`,
        prefillName: student?.firstName ? `${student.firstName} ${student.lastName || ""}`.trim() : "",
        prefillEmail: student?.email || "",
        prefillContact: student?.mobile || "",
        themeColor: "#7c3aed",
      });

      if (!result.success) {
        if ((result as any).error?.reason === "user_cancelled") {
          toast.info("Payment cancelled.");
        } else {
          toast.error(`Payment failed: ${(result as any).error?.description || "Unknown error"}`);
        }
        setIsRecharging(false);
        return;
      }

      // Step 4: Verify payment on backend & credit wallet
      const verifyRes = await studentApi.verifyWalletPayment({
        razorpay_order_id: result.razorpay_order_id,
        razorpay_payment_id: result.razorpay_payment_id,
        razorpay_signature: result.razorpay_signature,
      });

      if (verifyRes?.success) {
        const cashbackMsg = verifyRes.cashback
          ? ` + ₹${verifyRes.cashback.amount} cashback 🎉`
          : "";
        toast.success(`Wallet recharged successfully!${cashbackMsg}`);
        queryClient.invalidateQueries({ queryKey: ["studentProfile"] });
        queryClient.invalidateQueries({ queryKey: ["studentWalletHistory"] });
        setShowConfirmModal(false);
        setShowRechargeModal(false);
      } else {
        toast.error(verifyRes?.message || "Payment verification failed. Contact support.");
      }
    } catch (err: any) {
      console.error("Recharge error:", err);
      toast.error(err?.response?.data?.message || "Something went wrong during payment.");
    } finally {
      setIsRecharging(false);
    }
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
            <button
              onClick={() => navigate(PATHS.TRANSACTION_HISTORY)}
              className="text-[10px] font-black uppercase tracking-wider text-violet-600 dark:text-violet-400 hover:text-violet-555 cursor-pointer active:scale-95 transition-all border-none bg-transparent"
            >
              View Full History →
            </button>
          </div>

          {/* Filter Chips */}
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
                      : "bg-slate-50 dark:bg-[#1b173c] border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  )}
                >
                  {labelMap[filter]}
                </button>
              );
            })}
          </div>

          {isHistoryLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-slate-400" size={24} />
            </div>
          ) : (() => {
            const list = walletHistory as any[];
            const filteredList = list ? list.filter((tx) => {
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
                <div className="text-center py-10 rounded-[2rem] border border-dashed border-slate-200 dark:border-[#221c4e]">
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500">No matching transactions found.</p>
                </div>
              );
            }

            const visibleList = filteredList.slice(0, 10);
            const hasMore = filteredList.length > 10;

            return (
              <div className="space-y-4">
                <div className="w-full rounded-[2.5rem] border border-slate-100 dark:border-[#221c4e] bg-white dark:bg-[#161233] divide-y divide-slate-50 dark:divide-[#221c4e] overflow-hidden shadow-sm transition-colors duration-300">
                  {visibleList.map((tx: any) => {
                    const isDebit = tx.change?.startsWith("-") || tx.points < 0;
                    const isFailed = tx.type === "failed";
                    return (
                      <div key={tx.id} className="flex items-center justify-between gap-4 p-4 px-4 sm:px-6">
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

                {hasMore && (
                  <Button
                    onClick={() => navigate(PATHS.TRANSACTION_HISTORY)}
                    variant="outline"
                    className="w-full h-11 rounded-2xl border-slate-200 dark:border-[#221c4e] bg-white dark:bg-[#161233] text-violet-600 dark:text-violet-400 font-black text-xs uppercase tracking-wider transition-all active:scale-[0.98]"
                  >
                    Show More Transactions
                  </Button>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Admin Edit Bonus Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-[110] bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm p-6 rounded-[2rem] border border-amber-500/40 bg-zinc-950 text-white shadow-2xl flex flex-col gap-4 text-left">
            <div className="absolute inset-0 rounded-[2rem] opacity-25 pointer-events-none shadow-[0_0_40px_rgba(245,158,11,0.25)]" />
            
            <button 
              onClick={() => setShowAdminModal(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div>
              <h3 className="text-sm font-black text-amber-500 uppercase tracking-widest">Configure Bonus</h3>
              {selectedAdminAmt > 0 ? (
                <p className="text-xs text-white/60 mt-1">Recharge Amount: <span className="font-extrabold text-white">₹{selectedAdminAmt}</span></p>
              ) : (
                <div className="flex flex-col gap-1.5 mt-3">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-white/40">Recharge Amount (₹)</label>
                  <input
                    type="number"
                    value={selectedAdminAmt || ""}
                    onChange={(e) => setSelectedAdminAmt(Number(e.target.value))}
                    placeholder="e.g. 1000"
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-extrabold focus:outline-none focus:border-amber-500 text-white"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-white/40">Bonus Percentage (%)</label>
              <input
                type="number"
                value={adminBonusPercent}
                onChange={(e) => setAdminBonusPercent(Number(e.target.value))}
                placeholder="e.g. 10"
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-extrabold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-white/40">Recommended Tag (Optional)</label>
              <input
                type="text"
                value={adminTag}
                onChange={(e) => setAdminTag(e.target.value)}
                placeholder="e.g. Most Popular, Best Value"
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-extrabold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center justify-between py-2 border-t border-b border-white/5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/40">Offer Status</span>
              <button
                onClick={() => setAdminIsActive(!adminIsActive)}
                className={cn(
                  "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                  adminIsActive ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"
                )}
              >
                {adminIsActive ? "Active" : "Inactive"}
              </button>
            </div>

            <div className="flex gap-3 mt-2">
              <Button
                variant="outline"
                onClick={() => setShowAdminModal(false)}
                className="flex-1 h-11 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-extrabold text-xs tracking-wider uppercase"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveAdminBonus}
                disabled={savingAdmin}
                className="flex-1 h-11 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs tracking-wider uppercase shadow-lg shadow-amber-500/10"
              >
                {savingAdmin ? "Saving..." : "Save Bonus"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── RECHARGE POPUP MODAL ── */}
      {showRechargeModal && (
        <div className="fixed inset-0 z-50 flex justify-center bg-[#f8fafc] dark:bg-[#0b081e] overflow-y-auto p-0 font-sans">
          <div className="relative w-full max-w-md bg-[#f8fafc] dark:bg-[#0b081e] p-5 flex flex-col gap-4 text-slate-850 dark:text-slate-100 min-h-svh pb-8">

            {/* Header */}
            <div className="flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowRechargeModal(false)}
                  className="h-10 w-10 rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white active:scale-95 transition-transform cursor-pointer"
                >
                  <ChevronLeft size={20} className="stroke-[2.5px]" />
                </button>
                <div className="text-left">
                  <h1 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">My Wallet</h1>
                </div>
              </div>

              {/* Wallet Balance Pill */}
              <div className="flex items-center gap-2">
                {activePackTab === "combo" ? (
                  <>
                    {/* AI Credits Pill */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[0.75rem] bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100/70 dark:border-amber-900/30 text-left shadow-sm">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 leading-tight">{wallet?.aiCredits || 0}</span>
                        <span className="text-[6px] text-amber-400 dark:text-amber-500 font-extrabold uppercase tracking-widest leading-none">AI Tutor</span>
                      </div>
                    </div>
                    {/* Doubt Credits Pill */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[0.75rem] bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-100/70 dark:border-cyan-900/30 text-left shadow-sm">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-cyan-600 dark:text-cyan-400 leading-tight">{wallet?.humanChatCredits || 0}</span>
                        <span className="text-[6px] text-cyan-400 dark:text-cyan-505 font-extrabold uppercase tracking-widest leading-none">Doubt</span>
                      </div>
                    </div>
                  </>
                ) : activePackTab === "ai" ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-[1rem] bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100/70 dark:border-amber-900/30 text-left shadow-sm">
                    <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shrink-0">
                      <Zap size={12} className="stroke-[2.5px]" />
                    </div>
                    <div className="flex flex-col ml-1.5">
                      <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 leading-tight">{wallet?.aiCredits || 0}</span>
                      <span className="text-[7px] text-amber-400 dark:text-amber-505 font-extrabold uppercase tracking-widest mt-0.5">AI Credits</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-[1rem] bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-100/70 dark:border-cyan-900/30 text-left shadow-sm">
                    <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-white shrink-0">
                      <MessageSquare size={12} className="stroke-[2.5px]" />
                    </div>
                    <div className="flex flex-col ml-1.5">
                      <span className="text-xs font-extrabold text-cyan-600 dark:text-cyan-400 leading-tight">{wallet?.humanChatCredits || 0}</span>
                      <span className="text-[7px] text-cyan-400 dark:text-cyan-505 font-extrabold uppercase tracking-widest mt-0.5">Doubt Credits</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {showAdminTools && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-left shrink-0">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-wider text-amber-500">Admin Control</span>
                    <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">Edit Cashback Pack Bonuses</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsAdminMode(!isAdminMode)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all cursor-pointer",
                    isAdminMode ? "bg-amber-500 text-black shadow-lg" : "bg-white/5 text-amber-500 border border-amber-500/30"
                  )}
                >
                  {isAdminMode ? "Editing Bonuses" : "Enable Editing"}
                </button>
              </div>
            )}

            {/* Tab Switches */}
            <div className="flex border border-slate-105 dark:border-[#221c4e] rounded-[1.25rem] p-0.5 bg-white dark:bg-slate-900 shadow-sm shrink-0">
              {(["combo", "ai", "doubt"] as const).map((tab) => {
                const labelMap = {
                  combo: "Combo",
                  ai: "AI Top-up",
                  doubt: "Doubt Top-up",
                };
                const isActive = activePackTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => {
                      setActivePackTab(tab);
                      setUsePointsRedemption(false);
                    }}
                    className={cn(
                      "flex-1 py-2 text-[9.5px] font-extrabold uppercase tracking-widest rounded-[1rem] transition-all cursor-pointer",
                      isActive
                        ? "bg-violet-600 text-white shadow-md shadow-violet-600/10"
                        : "text-slate-400 dark:text-slate-505 hover:text-slate-700 dark:hover:text-white"
                    )}
                  >
                    {labelMap[tab]}
                  </button>
                );
              })}
            </div>

            {/* Enter Amount Section */}
            <div className="flex flex-col gap-1.5 shrink-0 text-left">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 pl-1">
                Enter Amount
              </label>
              <div className="flex items-center gap-3.5">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-extrabold text-slate-800 dark:text-white">₹</span>
                  <input
                    type="number"
                    value={customAmountInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomAmountInput(val);
                      const parsed = parseFloat(val);
                      setRechargeAmount(!isNaN(parsed) ? parsed : 0);
                    }}
                    placeholder="1000"
                    className="w-full pl-8 pr-9 py-2.5 rounded-[1.1rem] border border-slate-200 dark:border-[#221c4e] bg-white dark:bg-[#1b173c] text-sm font-extrabold focus:outline-none focus:border-violet-500 shadow-sm transition-colors text-slate-800 dark:text-white"
                  />
                  {customAmountInput && (
                    <button
                      onClick={() => {
                        setCustomAmountInput("");
                        setRechargeAmount(0);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 dark:hover:text-white shrink-0"
                    >
                      <X size={14} className="stroke-[3px]" />
                    </button>
                  )}
                </div>
              </div>
            </div>



            {/* Recharge Packs Grid */}
            <div className="shrink-0">
              <div className="grid grid-cols-3 gap-2.5">
                {(() => {
                  const sortedOffers = [...cashbackOffers]
                    .filter((o: any) => (isAdminMode || o.isActive) && (o.rechargeType || 'combo') === activePackTab)
                    .sort((a: any, b: any) => a.minRechargeAmount - b.minRechargeAmount);
                  
                  const list = sortedOffers.length > 0 
                    ? sortedOffers 
                    : isAdminMode 
                      ? [] 
                      : [{ minRechargeAmount: 5000, cashbackPercent: 0 }];

                  return (
                    <>
                      {list.map((offer: any) => {
                        const amt = offer.minRechargeAmount;
                        const percentVal = offer.cashbackPercent > 0
                          ? offer.cashbackPercent
                          : offer.cashbackAmount
                            ? Math.round((offer.cashbackAmount / amt) * 100)
                            : 0;

                        const tag = offer.recommendedText || "";
                        const isSelected = rechargeAmount === amt;

                        return (
                          <div
                            key={offer._id || amt}
                            onClick={() => {
                              if (isAdminMode) {
                                setSelectedAdminAmt(amt);
                                setAdminBonusPercent(percentVal);
                                setAdminTag(tag);
                                setAdminOfferId(offer._id || null);
                                setAdminIsActive(offer.isActive !== undefined ? offer.isActive : true);
                                setShowAdminModal(true);
                              } else {
                                setRechargeAmount(amt);
                                setCustomAmountInput(String(amt));
                              }
                            }}
                            className={cn(
                              "relative rounded-[1.25rem] border flex flex-col justify-between overflow-hidden cursor-pointer transition-all active:scale-[0.96] text-center aspect-[1.48/1] shadow-sm",
                              isAdminMode
                                ? offer.isActive === false
                                  ? "bg-red-500/5 dark:bg-red-500/10 border-red-500/40 border-dashed hover:border-red-500"
                                  : "bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/40 border-dashed hover:border-amber-500"
                                : isSelected
                                  ? "bg-violet-50/20 dark:bg-violet-600/10 border-violet-600 border-2"
                                  : "bg-white dark:bg-[#1b173c] border-slate-100 dark:border-[#221c4e] text-slate-800 dark:text-slate-105 hover:border-slate-200"
                            )}
                          >
                            {!isAdminMode && isSelected && (
                              <div className="absolute top-1 right-1 h-3.5 w-3.5 bg-violet-600 rounded-full flex items-center justify-center text-white shrink-0 z-10 shadow-sm">
                                <Check className="h-2 w-2 stroke-[4.5px]" />
                              </div>
                            )}

                            {!isAdminMode && offer.isRecommended && (
                              <span className="absolute top-1 left-1/2 -translate-x-1/2 bg-amber-400 text-[6px] text-white px-1.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider scale-[0.75] origin-center shadow-sm whitespace-nowrap z-10">
                                ★ Best
                              </span>
                            )}

                            <div className="flex-1 flex items-center justify-center pt-2.5">
                              <span className="text-xs font-extrabold">₹{amt}</span>
                            </div>

                            <div className={cn(
                              "text-[8px] font-extrabold py-1.5 border-t whitespace-nowrap",
                              isAdminMode && offer.isActive === false
                                ? "bg-red-50 dark:bg-red-950/20 text-red-500 dark:text-red-400 border-red-100 dark:border-red-900/30"
                                : percentVal > 0
                                  ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30"
                                  : "bg-slate-50 dark:bg-slate-900/40 text-slate-400 dark:text-slate-505 border-slate-105 dark:border-slate-850"
                            )}>
                              {isAdminMode && offer.isActive === false
                                ? "Inactive"
                                : percentVal > 0 
                                  ? `+${percentVal}% Bonus` 
                                  : "No Bonus"}
                            </div>
                          </div>
                        );
                      })}
                      
                      {isAdminMode && (
                        <div
                          onClick={() => {
                            setSelectedAdminAmt(0);
                            setAdminBonusPercent(0);
                            setAdminTag("");
                            setAdminOfferId(null);
                            setAdminIsActive(true);
                            setShowAdminModal(true);
                          }}
                          className="relative rounded-[1.25rem] border border-dashed border-amber-500/50 bg-amber-500/5 flex flex-col items-center justify-center cursor-pointer transition-all active:scale-[0.96] text-center aspect-[1.48/1] shadow-sm hover:border-amber-500"
                        >
                          <Plus className="h-5 w-5 text-amber-500 mb-1" />
                          <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider">Add Pack</span>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>



            {/* Recharge Summary Box */}
            {rechargeAmount >= 50 && (
              <div className="relative py-3 px-4.5 rounded-[1.25rem] border border-slate-200/60 dark:border-[#221c4e] bg-white dark:bg-[#161233]/45 flex items-center overflow-hidden shrink-0 text-left shadow-sm">

                <div className="flex flex-col gap-2 w-full">
                  <h3 className="text-[10px] font-extrabold text-slate-850 dark:text-white uppercase tracking-widest">Recharge Summary</h3>
                  <div className="flex justify-between items-center w-full mt-1.5 pr-2">
                    <div>
                      <p className="text-[8px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-wider">Recharge</p>
                      <p className="text-sm font-extrabold text-slate-800 dark:text-white mt-0.5">₹{rechargeAmount}</p>
                    </div>

                    {/* Bonus Column */}
                    {(() => {
                      const sortedOffers = [...cashbackOffers]
                        .filter((o: any) => o.isActive && (o.rechargeType || 'combo') === activePackTab)
                        .sort((a: any, b: any) => b.minRechargeAmount - a.minRechargeAmount);
                      const activeOffer = sortedOffers.find((o: any) => rechargeAmount >= o.minRechargeAmount);
                      const bonusAmount = activeOffer
                        ? activeOffer.cashbackPercent > 0
                          ? Math.round((rechargeAmount * activeOffer.cashbackPercent) / 100)
                          : activeOffer.cashbackAmount
                        : 0;

                      if (activePackTab === "ai") {
                        const baseCredits = rechargeAmount * 10;
                        const bonusCredits = bonusAmount * 10;
                        return (
                          <>
                            <div>
                              <p className="text-[8px] font-extrabold text-emerald-500 uppercase tracking-wider">Bonus</p>
                              <p className="text-sm font-extrabold text-emerald-500 mt-0.5">+{bonusCredits} AI Credits</p>
                            </div>
                            <div>
                              <p className="text-[8px] font-extrabold text-violet-500 uppercase tracking-wider">Receive</p>
                              <p className="text-sm font-extrabold text-violet-500 mt-0.5">{baseCredits + bonusCredits} AI Credits</p>
                            </div>
                          </>
                        );
                      }

                      if (activePackTab === "doubt") {
                        const baseCredits = rechargeAmount * 1;
                        const bonusCredits = bonusAmount * 1;
                        return (
                          <>
                            <div>
                              <p className="text-[8px] font-extrabold text-emerald-500 uppercase tracking-wider">Bonus</p>
                              <p className="text-sm font-extrabold text-emerald-500 mt-0.5">+{bonusCredits} Doubt Credits</p>
                            </div>
                            <div>
                              <p className="text-[8px] font-extrabold text-violet-500 uppercase tracking-wider">Receive</p>
                              <p className="text-sm font-extrabold text-violet-500 mt-0.5">{baseCredits + bonusCredits} Doubt Credits</p>
                            </div>
                          </>
                        );
                      }

                      // Fallback / Combo mode
                      return (
                        <>
                          <div>
                            <p className="text-[8px] font-extrabold text-emerald-500 uppercase tracking-wider">Bonus</p>
                            <p className="text-sm font-extrabold text-emerald-500 mt-0.5">+₹{bonusAmount}</p>
                          </div>
                          <div>
                            <p className="text-[8px] font-extrabold text-violet-500 uppercase tracking-wider">Receive</p>
                            <p className="text-sm font-extrabold text-violet-500 mt-0.5">₹{rechargeAmount + bonusAmount}</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* Points discount checkbox selector */}
            {pointsToRedeem > 0 && rechargeAmount >= 50 && (
              <div className="flex items-center justify-between p-3.5 rounded-[1.1rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-left shrink-0 shadow-sm text-slate-800 dark:text-white">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-extrabold text-violet-600 dark:text-violet-400 uppercase tracking-wider">Redeem Points (Max 25%)</span>
                  <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold">Use {pointsToRedeem} PTS to get ₹{pointsValueDiscount.toFixed(2)} off</span>
                </div>
                <input
                  type="checkbox"
                  checked={usePointsRedemption}
                  onChange={(e) => setUsePointsRedemption(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-350 dark:border-slate-700 text-violet-600 focus:ring-violet-500 cursor-pointer accent-violet-600"
                />
              </div>
            )}

            {/* Footer lock message */}
            <div className="flex items-center justify-center gap-1.5 text-[8.5px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest shrink-0 mt-1">
              <span>🛡️</span>
              <span>Secure payments. Your data is always protected.</span>
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-3.5 shrink-0 mt-auto pt-2.5 border-t border-slate-100 dark:border-[#221c4e]">
              <Button
                onClick={() => setShowRechargeModal(false)}
                className="flex-[0.35] h-11.5 rounded-[1.1rem] border border-violet-600/40 dark:border-violet-700/60 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-900/40 text-violet-600 dark:text-violet-400 font-extrabold text-xs uppercase cursor-pointer transition-all active:scale-[0.98]"
              >
                Cancel
              </Button>

              <Button
                onClick={handleConfirmRecharge}
                disabled={rechargeAmount < 50 || rechargeAmount > 100000 || isRecharging}
                className="flex-[0.65] h-11.5 rounded-[1.1rem] bg-gradient-to-r from-violet-600 to-indigo-700 dark:from-violet-800 dark:to-indigo-950 hover:brightness-110 text-white font-extrabold text-xs uppercase tracking-widest border-none shadow-md shadow-violet-600/10 dark:shadow-violet-850/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isRecharging ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    Pay ₹{finalPriceToPay.toFixed(2)} 🔒
                  </>
                )}
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

              {(() => {
                const sortedOffers = [...cashbackOffers]
                  .filter((o: any) => o.isActive)
                  .sort((a: any, b: any) => b.minRechargeAmount - a.minRechargeAmount);
                const activeOffer = sortedOffers.find((o: any) => rechargeAmount >= o.minRechargeAmount);
                if (!activeOffer) return null;
                const bonusAmount = activeOffer.cashbackPercent > 0
                  ? Math.round((rechargeAmount * activeOffer.cashbackPercent) / 100)
                  : activeOffer.cashbackAmount;
                return (
                  <div className="flex justify-between text-xs text-amber-500">
                    <span className="font-bold">Extra Money Bonus</span>
                    <span className="font-black">+₹{bonusAmount}</span>
                  </div>
                );
              })()}

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
    </div>
  );
}
