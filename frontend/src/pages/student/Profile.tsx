import { useNavigate } from "react-router-dom";
import { useStudentProfile, useStudentWalletHistory } from "@/hooks/use-student";
import { PATHS } from "@/routes/paths";
import {
  CreditCard, Smartphone, Users, History, ArrowRight, Award, ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GoldCoinsIcon } from "@/components/basic/GoldCoinsIcon";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";

export default function Profile() {
  const navigate = useNavigate();
  const { data: profile, isLoading: isProfileLoading } = useStudentProfile();
  const { data: walletHistory, isLoading: isHistoryLoading } = useStudentWalletHistory();

  const p = (profile as any)?.data ?? profile;
  const historyList = Array.isArray(walletHistory?.data) ? walletHistory.data : (Array.isArray(walletHistory) ? walletHistory : []);
  const isLoading = isProfileLoading || isHistoryLoading;

  // Calculate points and cash values
  const points = p?.totalPoints ?? p?.wallet?.totalPoints ?? 0;
  const cashValue = (points * 0.20).toFixed(2); // 10 PTS = ₹2 -> 1 PT = ₹0.2

  const menuItems = [
    {
      icon: <CreditCard className="text-purple-400 h-5 w-5" />,
      label: "Use in Subscription",
      subLabel: "Unlock content with your points",
      onClick: () => navigate(PATHS.PLAN_SCREEN),
      borderColor: "border-purple-500/20 hover:border-purple-500/40",
      bgColor: "bg-purple-950/10",
      iconBg: "bg-purple-500/10",
    },
    {
      icon: <Smartphone className="text-amber-400 h-5 w-5" />,
      label: "Use in Recharge",
      subLabel: "Top-up data or get vouchers",
      onClick: () => navigate(PATHS.COMING_SOON),
      borderColor: "border-amber-500/20 hover:border-amber-500/40",
      bgColor: "bg-amber-950/10",
      iconBg: "bg-amber-500/10",
    },
    {
      icon: <Users className="text-pink-400 h-5 w-5" />,
      label: "Refer & Earn",
      subLabel: "Invite friends and earn points",
      onClick: () => navigate(PATHS.REFER_EARN),
      borderColor: "border-pink-500/20 hover:border-pink-500/40",
      bgColor: "bg-pink-950/10",
      iconBg: "bg-pink-500/10",
    },
  ];

  // Loaded history replaces mockHistory

  if (isLoading) {
    return (
      <div className="min-h-svh bg-black text-white flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className={cn("min-h-svh w-full text-white flex flex-col items-center px-6 pt-8 pb-32 overflow-x-hidden relative", bgCss)}>

      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-[300px] bg-gradient-to-b from-blue-900/10 via-transparent to-transparent pointer-events-none -z-10" />

      <div className="w-full max-w-md flex flex-col gap-6">

        {/* ── HEADER ── */}
        <header className="relative w-full flex items-center justify-between mb-2 z-20">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(PATHS.STUDENT_DASHBOARD)}
            className="h-10 w-10 rounded-xl border-white/10 bg-white/5 text-white backdrop-blur-md"
          >
            <ChevronLeft size={20} />
          </Button>
          <div className="text-center flex-1 pr-10">
            <h1 className="text-lg font-bold tracking-[0.1em] uppercase">My Wallet</h1>
          </div>
        </header>

        {/* ── POINTS BALANCE CARD ── */}
        <Card className="border-1 border-cyan-500/60 bg-gradient-to-b from-slate-900/80 to-black/90 backdrop-blur-xl rounded-[1.5rem] overflow-hidden relative shadow-[0_0_30px_rgba(6,182,212,0.05)]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
          <CardContent className="p-6 flex flex-col items-center text-center space-y-4">

            {/* Points Row */}
            <div className="space-y-1">
              <span className="text-[10px] font-black tracking-[0.2em] text-white/50 uppercase">
                POINTS BALANCE
              </span>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="text-4xl font-black text-white font-sans tracking-tight">
                  {points.toLocaleString()}
                </span>
                <span className="text-sm font-black text-white/80 tracking-widest mt-2 uppercase">
                  PTS
                </span>
                <GoldCoinsIcon size={22} className="mt-1" />
              </div>
              <span className="text-[10px] text-white/30 tracking-wide block">
                Available Balance
              </span>
            </div>

            {/* Separator */}
            <div className="w-full h-[1px] bg-white/5" />

            {/* Conversion Value */}
            <div className="space-y-1 w-full">
              <span className="text-[10px] font-black tracking-[0.2em] text-white/50 uppercase">
                CONVERSION VALUE
              </span>
              <span className="text-2xl font-black text-cyan-400 tracking-tight block mt-1 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">
                ≈ ₹{cashValue}
              </span>
              <span className="text-[9px] text-white/30 font-medium tracking-normal block">
                Current Rate: 10 PTS = ₹2
              </span>
            </div>

          </CardContent>
        </Card>

        {/* ── MENU NAVIGATION LIST ── */}
        <div className="flex flex-col gap-3">
          {menuItems.map((item, index) => (
            <div
              key={index}
              onClick={item.onClick}
              className={`flex items-center justify-between p-4 rounded-2xl border ${item.borderColor} ${item.bgColor} cursor-pointer transition-all duration-300 active:scale-[0.98]`}
            >
              <div className="flex items-center gap-4">
                <div className={`h-10 w-10 rounded-xl ${item.iconBg} flex items-center justify-center`}>
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white tracking-wide">{item.label}</h4>
                  <p className="text-[10px] text-white/40 mt-0.5">{item.subLabel}</p>
                </div>
              </div>
              <ArrowRight className="text-white/20 h-4 w-4" />
            </div>
          ))}
        </div>

        {/* ── REWARD HISTORY LIST ── */}
        <div className="space-y-4 mt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black tracking-[0.15em] text-white/60 uppercase">
              REWARD HISTORY
            </h3>
            <span className="text-[10px] text-cyan-400 font-bold tracking-tight cursor-pointer hover:underline">
              View all transactions
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {!historyList || historyList.length === 0 ? (
              <div className="text-center py-6 text-white/30 text-xs font-semibold">
                No rewards earned yet. Complete MCQs or spin the wheel to earn points!
              </div>
            ) : (
              historyList.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-white/[0.02]"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-cyan-950/20 border border-cyan-500/20 flex items-center justify-center">
                      <Award className="text-cyan-400 h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <h5 className="text-xs font-bold text-white leading-tight">{item.title}</h5>
                      <p className="text-[9px] text-white/40 mt-1">
                        {new Date(item.time).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-cyan-400 tracking-wide">
                    {item.change}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
