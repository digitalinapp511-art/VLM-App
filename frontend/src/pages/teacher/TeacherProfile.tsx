import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Camera, User, BookOpen, Star, Mail, Phone, ShieldCheck, Home, Wallet, Library, LogOut, X } from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { teacherApi } from "@/lib/teacher-api";
import { PATHS } from "@/routes/paths";
import { authApi } from "@/lib/auth-api";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

export default function TeacherProfile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [copied, setCopied] = useState(false);

  const [verifyingType, setVerifyingType] = useState<"email" | "mobile" | null>(null);
  const [verifyingVal, setVerifyingVal] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ["teacherProfile"],
    queryFn: teacherApi.getProfile,
  });

  const p = profile?.user || {};

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
    queryClient.clear();
    navigate(PATHS.SPLASH, { replace: true });
  };

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

  return (
    <div className={cn("min-h-screen flex flex-col items-center p-6 pb-28 relative overflow-hidden", bgCss)}>
      {/* Decorative Assets */}
      <div className="absolute top-1/4 -right-4 text-cyan-400/20 blur-[1px] rotate-45">
        <Star size={16} fill="currentColor" />
      </div>
      <div className="absolute top-[40%] -left-3 text-purple-500/30 blur-[1px]">
        <Star size={20} fill="currentColor" />
      </div>

      {/* Header */}
      <header className="w-full max-w-xl flex items-center mb-10 z-10">
        <h1 className="flex-1 text-center text-sm font-bold text-zinc-400 uppercase tracking-widest mr-7">
          My Profile
        </h1>
      </header>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl space-y-6"
      >
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-4 p-8 rounded-[32px] border border-white/5 bg-white/[0.02] backdrop-blur-md">
          <div className="relative group">
            <Avatar className="w-24 h-24 border-2 border-white/10 bg-zinc-800">
              <AvatarImage src={profile?.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.fullName || "Teacher"}`} />
              <AvatarFallback>{(profile?.fullName || "T")[0]}</AvatarFallback>
            </Avatar>
            <button 
              onClick={() => navigate(PATHS.TEACHER_EDIT_PROFILE)}
              className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full border-2 border-black hover:bg-blue-500 transition-colors shadow-lg"
            >
              <Camera size={16} className="text-white" />
            </button>
          </div>
          <div className="text-center flex flex-col items-center">
            <h2 className="text-2xl font-black text-white tracking-tight">
              {isLoading ? "Loading..." : profile?.fullName || profile?.user?.fullName || "Teacher"}
            </h2>
            <p className="text-cyan-400 text-xs font-bold tracking-widest uppercase mt-1">
              {profile?.applicationStatus === "approved" ? "Verified Teacher" : "Profile Draft"}
            </p>
            {profile?.vlmTeacherId && (
              <div className="mt-3 inline-flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-3 py-1">
                <span className="text-[10px] text-cyan-400 font-bold tracking-widest uppercase">
                  ID:
                </span>
                <span className="text-[10px] font-mono font-bold text-white tracking-widest">
                  {profile.vlmTeacherId}
                </span>
                <button
                  type="button"
                  title="Copy VLM ID"
                  onClick={() => {
                    navigator.clipboard.writeText(profile.vlmTeacherId);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="text-cyan-400/60 hover:text-cyan-400 transition-colors cursor-pointer flex items-center gap-1 ml-1"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {copied && (
                    <span className="text-[8px] font-bold text-cyan-400 animate-pulse">
                      Copied!
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Info Form */}
        <div className="p-6 rounded-[32px] border border-white/5 bg-white/[0.02] backdrop-blur-md space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <User size={16} /> Basic Information
            </h3>
            <Button
              onClick={() => navigate(PATHS.TEACHER_EDIT_PROFILE)}
              size="sm"
              className="h-8 px-4 rounded-full text-xs font-bold border border-cyan-400/20 bg-cyan-400/10 hover:bg-cyan-400/20 text-cyan-400 transition-all"
            >
              Edit Details
            </Button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-xs font-medium text-zinc-500 uppercase ml-2">Full Name</label>
              <div className="mt-1 flex items-center p-4 rounded-2xl bg-black/40 border border-white/5 text-white">
                <User size={18} className="text-zinc-600 mr-3" />
                <span className="flex-1">{profile?.fullName || profile?.user?.fullName || "N/A"}</span>
              </div>
            </div>

            {/* Phone Number with verification status */}
            <div>
              <label className="text-xs font-medium text-zinc-500 uppercase ml-2">Phone Number</label>
              <div className="mt-1 flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5 text-white">
                <div className="flex items-center flex-1 min-w-0">
                  <Phone size={18} className="text-zinc-600 mr-3 shrink-0" />
                  <span className="truncate">{p.mobile ? `+91 ${p.mobile}` : "N/A"}</span>
                </div>
                <div className="shrink-0 pl-2">
                  {p.isMobileVerified ? (
                    <span className="inline-flex items-center text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Verified
                    </span>
                  ) : (
                    p.mobile ? (
                      <button
                        onClick={() => startVerification("mobile", p.mobile)}
                        className="text-[9px] font-black text-cyan-400 hover:text-cyan-300 bg-cyan-400/10 hover:bg-cyan-400/20 px-3 py-1 rounded-full uppercase tracking-wider cursor-pointer transition-all"
                      >
                        Verify
                      </button>
                    ) : (
                      <span className="text-[9px] font-black text-zinc-500 bg-zinc-800 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Not Added
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Email Address with verification status */}
            <div>
              <label className="text-xs font-medium text-zinc-500 uppercase ml-2">Email Address</label>
              <div className="mt-1 flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5 text-white">
                <div className="flex items-center flex-1 min-w-0">
                  <Mail size={18} className="text-zinc-600 mr-3 shrink-0" />
                  <span className="truncate">{p.email || "Not Provided"}</span>
                </div>
                <div className="shrink-0 pl-2">
                  {p.isEmailVerified ? (
                    <span className="inline-flex items-center text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Verified
                    </span>
                  ) : (
                    p.email ? (
                      <button
                        onClick={() => startVerification("email", p.email)}
                        className="text-[9px] font-black text-cyan-400 hover:text-cyan-300 bg-cyan-400/10 hover:bg-cyan-400/20 px-3 py-1 rounded-full uppercase tracking-wider cursor-pointer transition-all"
                      >
                        Verify
                      </button>
                    ) : (
                      <span className="text-[9px] font-black text-zinc-500 bg-zinc-800 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Not Provided
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Teaching Specializations */}
        <div className="p-6 rounded-[32px] border border-white/5 bg-white/[0.02] backdrop-blur-md space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <BookOpen size={16} /> Teaching Specializations
            </h3>
            <Button
              onClick={() => navigate(PATHS.TEACHER_EDIT_PROFILE)}
              size="sm"
              className="h-8 px-4 rounded-full text-xs font-bold border border-cyan-400/20 bg-cyan-400/10 hover:bg-cyan-400/20 text-cyan-400 transition-all"
            >
              Update
            </Button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-xs font-medium text-zinc-500 uppercase ml-2">Subjects</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {profile?.subjects?.length > 0 ? (
                  profile.subjects.map((s: string, idx: number) => (
                    <span key={idx} className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-bold px-3 py-1.5 rounded-xl">
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-zinc-600 ml-2">No subjects added</span>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-500 uppercase ml-2">Classes</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {profile?.classes?.length > 0 ? (
                  profile.classes.map((c: string, idx: number) => (
                    <span key={idx} className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold px-3 py-1.5 rounded-xl">
                      {c}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-zinc-600 ml-2">No classes added</span>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-500 uppercase ml-2">Boards</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {profile?.boards?.length > 0 ? (
                  profile.boards.map((b: string, idx: number) => (
                    <span key={idx} className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-3 py-1.5 rounded-xl">
                      {b}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-zinc-600 ml-2">No boards added</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Verification Status */}
        <div className="p-6 rounded-[32px] border border-white/5 bg-white/[0.02] backdrop-blur-md space-y-4">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest border-b border-white/5 pb-4 flex items-center gap-2">
            <ShieldCheck size={16} /> Status
          </h3>
          <Button
            onClick={() => navigate(PATHS.VERIFICATION_STATUS)}
            variant="outline"
            className="w-full h-14 rounded-2xl border border-white/10 bg-white/5 text-white font-medium hover:bg-white/10 flex justify-between px-4"
          >
            <span>View Verification Status</span>
            <ChevronLeft size={18} className="rotate-180" />
          </Button>
        </div>

        {/* Log Out */}
        <div className="p-6 rounded-[32px] border border-red-500/10 bg-red-500/[0.01] backdrop-blur-md space-y-4">
          <Button
            onClick={() => setShowConfirmLogout(true)}
            variant="ghost"
            className="w-full h-14 rounded-2xl border border-red-500/20 bg-red-950/10 text-red-400 font-bold hover:bg-red-950/20 hover:text-red-300 hover:border-red-500/40 flex justify-between px-4 transition-all duration-300"
          >
            <span className="flex items-center gap-2">
              <LogOut size={18} />
              Log Out
            </span>
            <ChevronLeft size={18} className="rotate-180 opacity-50" />
          </Button>
        </div>

      </motion.div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full bg-[#0a0a0a]/95 border-t border-white/5 backdrop-blur-lg px-6 py-4 flex items-center justify-between z-50">
        <NavItem icon={<Home />} label="Home" onClick={() => navigate(PATHS.TEACHER_DASHBOARD)} />
        <NavItem icon={<BookOpen />} label="Classes" onClick={() => navigate(PATHS.TEACHER_CLASSES)} />
        <NavItem icon={<Wallet />} label="Wallet" onClick={() => navigate(PATHS.TEACHER_WALLET)} />
        <NavItem icon={<Library />} label="Library" onClick={() => navigate(PATHS.TEACHER_LIBRARY)} />
        <NavItem icon={<User />} label="Profile" active onClick={() => navigate(PATHS.TEACHER_PROFILE)} />
      </nav>

      {/* Verification Modal Overlay */}
      {verifyingType && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-[2rem] border border-white/10 bg-[#0f0b26] p-6 shadow-2xl relative text-white space-y-4">
            
            {/* Close Button */}
            <button 
              onClick={() => setVerifyingType(null)} 
              className="absolute top-4 right-4 text-white/40 hover:text-white cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black tracking-tight">
                Verify {verifyingType === "email" ? "Email Address" : "Phone Number"}
              </h3>
              <p className="text-xs text-slate-500 font-bold">
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
                <p className="text-xs text-white/60 text-center leading-relaxed font-semibold">
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
                  <label className="text-[9px] uppercase tracking-widest text-slate-500 font-black">Enter Verification Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    className="bg-[#070417] border border-violet-950 rounded-2xl h-12 w-full text-center text-sm font-bold tracking-widest text-white outline-none focus-within:border-violet-500/50"
                  />
                </div>
                <div className="flex gap-2.5">
                  <Button
                    onClick={() => startVerification(verifyingType, verifyingVal)}
                    disabled={isSendingOtp || isVerifyingOtp}
                    variant="outline"
                    className="flex-1 h-12 rounded-2xl text-xs font-black uppercase border-white/10 text-white/80 cursor-pointer"
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

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmLogout && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmLogout(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm rounded-[32px] border border-white/10 bg-zinc-900/90 p-8 text-center shadow-2xl backdrop-blur-xl"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-500 mb-6">
                <LogOut size={28} />
              </div>

              <h3 className="text-xl font-black text-white tracking-tight">
                Log Out?
              </h3>
              <p className="mt-2 text-sm text-zinc-400 font-medium">
                Are you sure you want to log out of your teacher account?
              </p>

              <div className="mt-8 flex flex-col gap-3">
                <Button
                  onClick={handleLogout}
                  className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold tracking-wide transition-all active:scale-[0.98]"
                >
                  Log Out
                </Button>
                <Button
                  onClick={() => setShowConfirmLogout(false)}
                  variant="outline"
                  className="w-full h-12 rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10 font-bold tracking-wide transition-all active:scale-[0.98]"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const NavItem = ({ icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex flex-col items-center gap-1.5 transition-all duration-300",
      active ? "text-cyan-400" : "text-zinc-600 hover:text-zinc-400"
    )}
  >
    <div className={cn("relative", active && "drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]")}>
      {React.cloneElement(icon, { size: 24, strokeWidth: active ? 2.5 : 1.5 })}
    </div>
    <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    {active && <motion.div layoutId="navDot" className="w-1 h-1 rounded-full bg-cyan-400" />}
  </button>
);
