import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import {
  User,
  BookOpen,
  Globe,
  ChevronLeft,
  LogOut,
  History,
  Wallet,
  X,
  Check,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Shadcn & UI Components
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/lib/auth-api";
import { useStudentProfile } from "@/hooks/use-student";
import LoadingSkeleton from "@/components/basic/student/LoadingSkeleton";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";

export default function ProfileView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile, isLoading, error: profileError, refetch } = useStudentProfile();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [copied, setCopied] = useState(false);


  const [verifyingType, setVerifyingType] = useState<"email" | "mobile" | null>(null);
  const [verifyingVal, setVerifyingVal] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [sentOtp, setSentOtp] = useState<string | null>(null);

  const startVerification = async (type: "email" | "mobile", value: string) => {
    if (!value) return;
    setVerifyingType(type);
    setVerifyingVal(value);
    setOtpSent(false);
    setOtpCode("");
    setOtpError("");
    setSentOtp(null);
    setIsSendingOtp(true);

    try {
      const data = await authApi.sendOtp(value, "verify");
      const receivedOtp = data?.otp || data?.code || data?.data?.otp || data?.data?.code;
      if (receivedOtp) {
        setSentOtp(String(receivedOtp));
      }
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

  useEffect(() => {
    if (profileError) {
      const err = profileError as any;
      if (err?.response?.status === 404) {
        navigate(PATHS.STUDENT_PROFILE_SETUP, { replace: true });
      }
    }
  }, [profileError, navigate]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error(err);
    }
    queryClient.clear();
    navigate(PATHS.LOGIN_STUDENT, { replace: true });
  };

  if (isLoading) return <LoadingSkeleton />;

  const p = (profile as any)?.data ?? profile;

  return (
    <div className="relative min-h-svh w-full bg-[#f4f6ff] dark:bg-[#0b081e] text-slate-800 dark:text-slate-100 flex flex-col items-center px-5 pt-4 overflow-x-hidden pb-32 font-sans transition-colors duration-300">
      <div className="max-w-md w-full flex flex-col gap-5">
        
        {/* ── HEADER ── */}
        <header className="flex w-full items-center gap-4 pb-2 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <button
            onClick={() => navigate(PATHS.STUDENT_DASHBOARD)}
            className="h-10 w-10 rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white active:scale-90 transition-transform"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-sm font-black tracking-tight text-slate-800 dark:text-slate-100">My Profile</h1>
        </header>

        {/* ── PROFILE AVATAR BLOCK ── */}
        <div className="flex flex-col items-center gap-4 p-6 rounded-3xl border border-slate-100 dark:border-[#221c4e] bg-white dark:bg-[#161233] shadow-sm w-full">
          <div className="relative">
            <div className="relative h-24 w-24 rounded-full border-4 border-violet-400 bg-slate-50 dark:bg-slate-800 flex items-center justify-center shadow-md overflow-hidden">
              {p?.profilePhoto ? (
                <img src={p.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={38} className="text-violet-500 dark:text-violet-400" />
              )}
            </div>
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{p?.fullName || "Student"}</h2>
            <p className="text-violet-600 dark:text-violet-400 text-xs font-black tracking-wider uppercase">
              Student Profile
            </p>
            {p?.vlmStudentId && (
              <div className="mt-2 inline-flex items-center gap-1.5 bg-violet-50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/30 rounded-full px-3 py-1">
                <span className="text-[9px] text-violet-500 dark:text-violet-400 font-black tracking-wider uppercase">
                  ID:
                </span>
                <span className="text-[10px] font-mono font-black text-slate-700 dark:text-slate-300 tracking-wider">
                  {p.vlmStudentId}
                </span>
                <button
                  type="button"
                  title="Copy VLM ID"
                  onClick={() => {
                    navigator.clipboard.writeText(p.vlmStudentId);
                    setCopied(true);
                    toast.success("VLM ID copied to clipboard");
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="text-violet-500 hover:text-violet-700 transition-colors cursor-pointer flex items-center gap-0.5 ml-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {copied && (
                    <span className="text-[8px] font-black text-violet-500 animate-pulse">
                      Copied
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── PROFILE DETAILS CARD ── */}
        <div className="p-5 rounded-3xl border border-slate-100 dark:border-[#221c4e] bg-white dark:bg-[#161233] shadow-sm space-y-5 w-full">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 px-0.5">
            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wide flex items-center gap-2">
              <User size={15} className="text-violet-600 dark:text-violet-400" /> Basic Information
            </h3>
            <Button
              onClick={() => navigate(PATHS.EDIT_PROFILE)}
              className="h-8 px-4 rounded-2xl text-[10px] font-black border border-violet-200 dark:border-violet-900/30 bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400 transition-all cursor-pointer shadow-sm"
            >
              Edit Details
            </Button>
          </div>

          <div className="space-y-3.5">
            <ProfileFieldWrapper icon={<User size={16} className="text-violet-600 dark:text-violet-400 mr-2.5" />} label="Full Name" value={p?.fullName} />
            <ProfileFieldWrapper icon={<User size={16} className="text-violet-600 dark:text-violet-400 mr-2.5" />} label="Nickname" value={p?.nickname} />
            <ProfileFieldWrapper icon={<BookOpen size={16} className="text-violet-600 dark:text-violet-400 mr-2.5" />} label="Class" value={p?.class ? `Class ${p.class}th` : undefined} />
            <ProfileFieldWrapper icon={<Globe size={16} className="text-violet-600 dark:text-violet-400 mr-2.5" />} label="City" value={p?.city} />
          </div>
        </div>

        {/* ── ACCOUNT STATUS & VERIFICATION CARD ── */}
        <div className="p-5 rounded-3xl border border-slate-100 dark:border-[#221c4e] bg-white dark:bg-[#161233] shadow-sm space-y-4 w-full text-slate-800 dark:text-slate-100">
          <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wide flex items-center gap-2 text-left">
            <ShieldCheck size={15} className="text-violet-600 dark:text-violet-400" /> Account Credentials
          </h3>
          
          {/* Email Field */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 text-left">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/40 font-bold">Email Address</p>
              <p className="text-sm font-bold text-slate-850 dark:text-white truncate max-w-[200px]">{p.userId?.email || p.email || 'Not Added'}</p>
            </div>
            <div className="shrink-0 pl-2">
              {(() => {
                const emailVal = p.userId?.email || p.email;
                const emailVerified = (p.userId?.isEmailVerified && emailVal) || (p.isEmailVerified && emailVal);
                if (emailVerified) return (
                  <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Verified
                  </span>
                );
                if (emailVal) return (
                  <button
                    onClick={() => startVerification("email", emailVal)}
                    className="text-[9px] font-black text-violet-600 hover:text-violet-500 bg-violet-50 hover:bg-violet-100 dark:bg-violet-500/10 dark:text-violet-400 dark:hover:bg-violet-500/20 px-3 py-1 rounded-full uppercase tracking-wider cursor-pointer transition-colors"
                  >
                    Verify
                  </button>
                );
                return (
                  <span className="text-[9px] font-black text-slate-400 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Not Added
                  </span>
                );
              })()}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-slate-100 dark:bg-slate-800" />

          {/* Mobile Field */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 text-left">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/40 font-bold">Phone Number</p>
              <p className="text-sm font-bold text-slate-850 dark:text-white">{p.userId?.mobile || p.mobile ? `+91 ${p.userId?.mobile || p.mobile}` : 'Not Added'}</p>
            </div>
            <div className="shrink-0 pl-2">
              {(() => {
                const mobileVal = p.userId?.mobile || p.mobile;
                const mobileVerified = (p.userId?.isMobileVerified && mobileVal) || (p.isMobileVerified && mobileVal);
                if (mobileVerified) return (
                  <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Verified
                  </span>
                );
                if (mobileVal) return (
                  <button
                    onClick={() => startVerification("mobile", mobileVal)}
                    className="text-[9px] font-black text-violet-600 hover:text-violet-500 bg-violet-50 hover:bg-violet-100 dark:bg-violet-500/10 dark:text-violet-400 dark:hover:bg-violet-500/20 px-3 py-1 rounded-full uppercase tracking-wider cursor-pointer transition-colors"
                  >
                    Verify
                  </button>
                );
                return (
                  <span className="text-[9px] font-black text-slate-400 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Not Added
                  </span>
                );
              })()}
            </div>
          </div>
        </div>

        {/* ── HISTORY / NAVIGATION CARD ── */}
        <div className="p-3 rounded-3xl border border-slate-100 dark:border-[#221c4e] bg-white dark:bg-[#161233] shadow-sm w-full space-y-2">
          <div 
            onClick={() => navigate(PATHS.SESSION_HISTORY)}
            className="flex items-center justify-between p-3 rounded-2xl border border-slate-50 dark:border-[#221c4e] bg-slate-50/50 dark:bg-slate-900/20 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-violet-100 dark:bg-violet-950/30 flex items-center justify-center">
                <History size={16} className="text-violet-600 dark:text-violet-400" />
              </div>
              <div className="text-left">
                <span className="text-xs font-black text-slate-800 dark:text-slate-100 block">Session History</span>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 block mt-0.5">Click to view past chats and calls</span>
              </div>
            </div>
            <ChevronLeft size={16} className="text-slate-400 rotate-180" />
          </div>

          <div 
            onClick={() => navigate(PATHS.WALLET)}
            className="flex items-center justify-between p-3 rounded-2xl border border-slate-50 dark:border-[#221c4e] bg-slate-50/50 dark:bg-slate-900/20 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-violet-100 dark:bg-violet-950/30 flex items-center justify-center">
                <Wallet size={16} className="text-violet-600 dark:text-violet-400" />
              </div>
              <div className="text-left">
                <span className="text-xs font-black text-slate-800 dark:text-slate-100 block">My Wallet</span>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 block mt-0.5">Recharge points & view transactions</span>
              </div>
            </div>
            <ChevronLeft size={16} className="text-slate-400 rotate-180" />
          </div>
        </div>

        {/* ── LOGOUT CARD ── */}
        <div className="p-3 rounded-3xl border border-slate-100 dark:border-[#221c4e] bg-white dark:bg-[#161233] shadow-sm w-full">
          <Button
            onClick={() => setShowLogoutModal(true)}
            variant="ghost"
            className="w-full h-12 rounded-2xl border border-red-100 dark:border-red-950/40 bg-red-50/40 dark:bg-red-950/20 text-red-500 font-black hover:bg-red-50 hover:text-red-600 flex justify-between px-3 transition-all duration-300 shadow-sm"
          >
            <span className="flex items-center gap-2">
              <LogOut size={16} />
              Log Out
            </span>
            <ChevronLeft size={16} className="rotate-180 opacity-50" />
          </Button>
        </div>

      </div>

      {/* ── LOGOUT CONFIRMATION POPUP ── */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm rounded-[32px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#161233] p-8 text-center shadow-2xl text-slate-800 dark:text-slate-100"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/20 text-red-500 mb-6 border border-red-100 dark:border-red-900/30">
                <LogOut size={28} />
              </div>

              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight">
                Log Out?
              </h3>
              <p className="mt-2 text-xs text-slate-400 dark:text-slate-500 font-bold leading-relaxed">
                Are you sure you want to log out of your student account?
              </p>

              <div className="mt-6 flex flex-col gap-3">
                <Button
                  onClick={handleLogout}
                  className="w-full h-11 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-black transition-all active:scale-[0.98] shadow-sm"
                >
                  Log Out
                </Button>
                <Button
                  onClick={() => setShowLogoutModal(false)}
                  className="w-full h-11 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-black transition-all active:scale-[0.98] shadow-sm"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                {sentOtp && (
                  <div className="px-3 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-xl flex flex-col items-center">
                    <span className="text-[8px] font-black text-violet-600 dark:text-violet-400 uppercase tracking-widest">Sent OTP (Testing)</span>
                    <span className="text-sm font-mono font-black text-slate-700 dark:text-white mt-0.5">{sentOtp}</span>
                  </div>
                )}
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

function ProfileFieldWrapper({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
}) {
  return (
    <div className="space-y-1 text-left">
      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-1">{label}</label>
      <div className="flex items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">
        {icon}
        <span className="flex-1 text-xs font-bold truncate text-slate-700 dark:text-slate-300">{value || "Not set"}</span>
      </div>
    </div>
  );
}
