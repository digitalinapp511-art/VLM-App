import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useStudentProfile, useStudentWalletHistory } from "@/hooks/use-student";
import { PATHS } from "@/routes/paths";
import {
  CreditCard, Smartphone, Users, History, ArrowRight, Award, ChevronLeft, X, Check, ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GoldCoinsIcon } from "@/components/basic/GoldCoinsIcon";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { authApi } from "@/lib/auth-api";

export default function Profile() {
  const navigate = useNavigate();
  const { data: profile, isLoading: isProfileLoading, refetch } = useStudentProfile();
  const { data: walletHistory, isLoading: isHistoryLoading } = useStudentWalletHistory();

  const [verifyingType, setVerifyingType] = useState<"email" | "mobile" | null>(null);
  const [verifyingVal, setVerifyingVal] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const startVerification = async (type: "email" | "mobile", value: string) => {
    if (!value) return;
    setVerifyingType(type);
    setVerifyingVal(value);
    setOtpSent(false);
    setOtpCode("");
    setOtpError("");
    setIsSendingOtp(true);

    try {
      await authApi.sendOtp(value, "verification");
      setOtpSent(true);
      toast.success("Verification code sent successfully!");
    } catch (err: any) {
      console.error(err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to send verification code";
      setOtpError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setOtpError("Please enter a valid 6-digit verification code");
      return;
    }
    setIsVerifyingOtp(true);
    setOtpError("");

    try {
      const payload = verifyingType === "email" 
        ? { email: verifyingVal, otp: otpCode } 
        : { mobile: verifyingVal, otp: otpCode };
      
      const { data } = await apiClient.post("/auth/verify-profile-contact", payload);
      if (data.success) {
        toast.success(data.message || "Contact details verified successfully!");
        setVerifyingType(null);
        refetch();
      } else {
        setOtpError(data.message || "Invalid OTP code");
      }
    } catch (err: any) {
      console.error(err);
      const errMsg = err?.response?.data?.message || err?.message || "OTP verification failed";
      setOtpError(errMsg);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const p = (profile as any)?.data ?? profile;
  const wh = walletHistory as any;
  const historyList = Array.isArray(wh?.data) ? wh.data : (Array.isArray(wh) ? wh : []);
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

        {/* ── ACCOUNT STATUS & VERIFICATION CARD ── */}
        <Card className="border border-slate-200/80 dark:border-white/8 bg-white/80 dark:bg-white/4 backdrop-blur-sm rounded-[1.5rem] overflow-hidden shadow-sm dark:shadow-md">
          <CardContent className="p-5 space-y-4">
            <h3 className="text-xs font-black tracking-wider text-slate-400 dark:text-slate-500 uppercase text-left flex items-center gap-2">
              <ShieldCheck size={15} className="text-violet-600 dark:text-violet-400" /> Account Credentials
            </h3>
            
            {/* Email Field */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 text-left">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/40 font-bold">Email Address</p>
                <p className="text-sm font-bold text-slate-800 dark:text-white truncate max-w-[200px]">{p.userId?.email || p.email || 'Not Added'}</p>
              </div>
              <div className="shrink-0 pl-2">
                {p.userId?.isEmailVerified || p.isEmailVerified ? (
                  <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Verified
                  </span>
                ) : (
                  (p.userId?.email || p.email) ? (
                    <button
                      onClick={() => startVerification("email", p.userId?.email || p.email)}
                      className="text-[9px] font-black text-violet-600 hover:text-violet-500 bg-violet-50 hover:bg-violet-100 dark:bg-violet-500/10 dark:text-violet-400 dark:hover:bg-violet-500/20 px-3 py-1 rounded-full uppercase tracking-wider cursor-pointer transition-colors"
                    >
                      Verify
                    </button>
                  ) : (
                    <span className="text-[9px] font-black text-slate-400 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Not Added
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-200 dark:bg-white/8" />

            {/* Mobile Field */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 text-left">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/40 font-bold">Phone Number</p>
                <p className="text-sm font-bold text-slate-800 dark:text-white">{p.userId?.mobile || p.mobile ? `+91 ${p.userId?.mobile || p.mobile}` : 'Not Added'}</p>
              </div>
              <div className="shrink-0 pl-2">
                {p.userId?.isMobileVerified || p.isMobileVerified ? (
                  <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Verified
                  </span>
                ) : (
                  (p.userId?.mobile || p.mobile) ? (
                    <button
                      onClick={() => startVerification("mobile", p.userId?.mobile || p.mobile)}
                      className="text-[9px] font-black text-violet-600 hover:text-violet-500 bg-violet-50 hover:bg-violet-100 dark:bg-violet-500/10 dark:text-violet-400 dark:hover:bg-violet-500/20 px-3 py-1 rounded-full uppercase tracking-wider cursor-pointer transition-colors"
                    >
                      Verify
                    </button>
                  ) : (
                    <span className="text-[9px] font-black text-slate-400 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Not Added
                    </span>
                  )
                )}
              </div>
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

      {/* ── Verification Modal Overlay ── */}
      {verifyingType && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f0b26] p-6 shadow-2xl relative text-slate-800 dark:text-white space-y-4">
            
            {/* Close Button */}
            <button 
              onClick={() => setVerifyingType(null)} 
              className="absolute top-4 right-4 text-slate-400 dark:text-white/40 hover:text-slate-650 dark:hover:text-white cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black tracking-tight">
                Verify {verifyingType === "email" ? "Email Address" : "Phone Number"}
              </h3>
              <p className="text-xs text-slate-455 dark:text-slate-500 font-bold">
                {verifyingVal}
              </p>
            </div>

            {otpError && (
              <p className="text-rose-500 text-xs font-semibold text-center bg-rose-500/10 py-2 px-3 rounded-xl">
                {otpError}
              </p>
            )}

            {!otpSent ? (
              <div className="space-y-4 pt-2">
                <p className="text-xs text-slate-500 dark:text-white/60 text-center leading-relaxed font-semibold">
                  We need to verify this {verifyingType} before updating your account status. We will send a 6-digit OTP verification code.
                </p>
                <Button
                  onClick={() => startVerification(verifyingType, verifyingVal)}
                  disabled={isSendingOtp}
                  className="w-full h-12 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-700 hover:from-violet-500 hover:to-indigo-600 text-white font-black text-xs uppercase tracking-widest shadow-md shadow-violet-500/10 cursor-pointer border-none"
                >
                  {isSendingOtp ? "Sending OTP..." : "Send Verification Code"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <div className="space-y-1 text-left">
                  <label className="text-[9px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-black">Enter Verification Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    className="bg-slate-50 dark:bg-[#070417] border border-slate-200 dark:border-violet-950 rounded-2xl h-12 w-full text-center text-sm font-bold tracking-widest text-slate-800 dark:text-white outline-none focus-within:border-violet-500/50"
                  />
                </div>
                <div className="flex gap-2.5">
                  <Button
                    onClick={() => startVerification(verifyingType, verifyingVal)}
                    disabled={isSendingOtp || isVerifyingOtp}
                    variant="outline"
                    className="flex-1 h-12 rounded-2xl text-xs font-black uppercase border-slate-200 dark:border-white/10 text-slate-650 dark:text-white/80 cursor-pointer"
                  >
                    Resend
                  </Button>
                  <Button
                    onClick={handleVerifyOtp}
                    disabled={otpCode.length !== 6 || isVerifyingOtp}
                    className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-700 hover:from-violet-500 hover:to-indigo-600 text-white font-black text-xs uppercase tracking-widest shadow-md shadow-violet-500/10 cursor-pointer border-none"
                  >
                    {isVerifyingOtp ? "Verifying..." : "Verify"}
                  </Button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
