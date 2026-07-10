import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { VlmWordmark } from "@/components/basic/VlmWordMark";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { BackgroundElement } from "@/components/basic/BackgroundElements";
import { useVerifyOtp } from "@/hooks/use-auth";
import { PATHS } from "@/routes/paths";
import type { Role, VerifyOtpResponse } from "@/types";
import { authApi } from "@/lib/auth-api";
import logoImg from "../assets/logo.png";

function resolvePostOtpPath(role: Role, isNewUser: boolean, responseData?: any): string {
  if (role === "teacher") {
    return isNewUser
      ? PATHS.TEACHER_REGISTRATION
      : PATHS.TEACHER_DASHBOARD;
  }
  if (role === "parent") {
    const profile = responseData?.profile;
    const linkedChildren = profile?.linkedChildren || [];
    if (linkedChildren.length === 0) {
      return PATHS.ADD_CHILD;
    }
    const hasApproved = linkedChildren.some((c: any) => c.status === "approved");
    if (hasApproved) {
      return PATHS.PARENT_DASHBOARD;
    }
    return PATHS.PARENT_PENDING_APPROVAL;
  }

  return isNewUser
    ? PATHS.STUDENT_PROFILE_SETUP
    : PATHS.STUDENT_DASHBOARD;
}

export default function OtpVerificationPage() {
  const [otpValue, setOtpValue] = useState("");
  const [timer, setTimer] = useState(120);
  const [sentOtp, setSentOtp] = useState<string | null>(
    sessionStorage.getItem("vlm_sent_otp")
  );

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const navigate = useNavigate();
  const verifyMutation = useVerifyOtp();

  const role = (localStorage.getItem("vlm_role") ??
    sessionStorage.getItem("vlm_role") ??
    "student") as Role;

  const email =
    sessionStorage.getItem("vlm_email") || "";
  const maskedEmail = email
    ? email.replace(
        /(.{2})(.*)(@.*)/,
        (_, p1, p2, p3) => p1 + "*".repeat(Math.min(p2.length, 5)) + p3
      )
    : "";

  useEffect(() => {
    if (timer > 0) {
      const id = setTimeout(
        () => setTimer(timer - 1),
        1000
      );

      return () => clearTimeout(id);
    }
  }, [timer]);

  const handleVerify = () => {
    if (otpValue.length !== 6) return;

    verifyMutation.mutate(
      { email, otp: otpValue, role },
      {
        onSuccess: (data) => {
          navigate(resolvePostOtpPath(role, data.isNewUser, data), { replace: true });
        },
      }
    );
  };

  if (role === "student") {
    return (
      <div className="relative flex min-h-svh w-full flex-col items-center justify-center bg-[#f4f6ff] text-slate-800 p-4 overflow-hidden">
        {/* Subtle radial glow accents */}
        <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 rounded-full bg-violet-600/5 blur-[100px] -z-10" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-indigo-650/5 blur-[100px] -z-10" />

        {/* Content Box */}
        <div className="w-full max-w-sm flex flex-col items-center z-10 space-y-6">
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="h-14 w-auto flex items-center justify-center">
              <img src={logoImg} alt="VLM Academy" className="h-12 w-auto" />
            </div>
            <h1 className="text-xl font-black tracking-tight text-slate-800 mt-3">Enter Verification Code</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">A 6-digit code has been sent</p>
          </div>

          {/* OTP Card */}
          <div className="w-full bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-[2rem] p-6 sm:p-8 shadow-xl flex flex-col items-center space-y-5">
            <div className="text-center space-y-1.5 w-full">
              <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-wider">
                Verifying Credentials
              </h3>
              <div className="flex items-center justify-center gap-1.5 pt-0.5">
                <span className="text-slate-800 text-base font-extrabold tracking-tight">
                  {maskedEmail}
                </span>
                <div className="bg-green-500 rounded-full p-0.5">
                  <CheckCircle2 size={10} className="text-white fill-current" />
                </div>
              </div>

              {sentOtp && (
                <div className="mt-2 px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded-xl inline-flex flex-col items-center">
                  <span className="text-[8px] font-black text-violet-600 uppercase tracking-widest">Sent OTP (Testing)</span>
                  <span className="text-xs font-mono font-black text-slate-700 mt-0.5">{sentOtp}</span>
                </div>
              )}
            </div>

            {/* OTP Slots */}
            <div className="w-full">
              <InputOTP
                maxLength={6}
                value={otpValue}
                onChange={(val) => setOtpValue(val)}
                className="w-full"
              >
                <InputOTPGroup className="gap-1.5 flex w-full justify-between">
                  {[...Array(6)].map((_, i) => (
                    <InputOTPSlot
                      key={i}
                      index={i}
                      className={cn(
                        "h-10 w-10 sm:h-11 sm:w-11 rounded-xl border border-slate-200 bg-slate-50 text-sm sm:text-base font-bold text-slate-800 transition-all duration-300",
                        "data-[active=true]:ring-2 data-[active=true]:ring-violet-500/50 data-[active=true]:border-violet-500"
                      )}
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            {verifyMutation.isError && (
              <p className="text-rose-500 text-xs font-semibold text-center animate-pulse">
                {(verifyMutation.error as any)?.response?.data?.message || 
                 (verifyMutation.error as any)?.response?.data?.error || 
                 "Invalid OTP. Please try again."}
              </p>
            )}

            {/* Timer Badge */}
            <div className="flex items-center gap-1.5 bg-slate-100 px-4 py-1.5 rounded-full border border-slate-200 shadow-inner">
              <Clock size={12} className="text-amber-500" />
              <span className="text-slate-650 text-[10px] font-bold">
                Time remaining: <span className="font-mono ml-0.5">{formatTimer(timer)}</span>
              </span>
            </div>

            {/* Resend Action */}
            <div className="text-center w-full">
              <span className="text-slate-400 text-[10px] font-bold block">
                Didn't receive code?
              </span>
              <Button
                variant="link"
                disabled={timer > 0}
                className="text-violet-600 text-xs font-black p-0 h-auto underline underline-offset-2 hover:text-violet-500 mt-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={async () => {
                  if (timer > 0) return;
                  if (email) {
                    try {
                      const data = await authApi.sendOtp(email, "login");
                      const receivedOtp = data?.otp || data?.code || data?.data?.otp || data?.data?.code;
                      if (receivedOtp) {
                        sessionStorage.setItem("vlm_sent_otp", String(receivedOtp));
                        setSentOtp(String(receivedOtp));
                      }
                    } catch (err) {
                      console.error("Failed to resend OTP", err);
                    }
                  }
                  setTimer(120);
                }}
              >
                Resend OTP
              </Button>
            </div>

            {/* Submit Button */}
            <Button
              disabled={otpValue.length !== 6 || verifyMutation.isPending}
              onClick={handleVerify}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-700 hover:from-violet-500 hover:to-indigo-600 text-white font-black text-xs uppercase tracking-widest shadow-md shadow-violet-500/10 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 mt-2 border-none"
            >
              {verifyMutation.isPending ? "Verifying..." : "Verify & Log In"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative vlm-bg-navy flex min-h-svh w-full flex-col items-center justify-center bg-[#050505] px-6 overflow-hidden">
      <BackgroundElement />

      <VlmWordmark role={role} />

      <div className="relative z-10 mt-4 text-center space-y-2">
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Verification Required
        </h2>

        <p className="text-white/50 text-[13px] leading-relaxed max-w-[260px] mx-auto">
          We've sent a 6-digit code to your email address.
        </p>
      </div>

      <Card className="relative z-10 mt-4 w-full max-w-[360px] border-white/10 bg-[#1a1a1a]/40 backdrop-blur-xl rounded-[1.8rem] py-5 px-4 shadow-xl">
        <CardContent className="flex flex-col items-center p-0">
          <div className="text-center space-y-0.5 mb-4">
            <h3 className="text-white/70 text-xs font-semibold uppercase tracking-wider">
              Verify your Email
            </h3>

            <div className="flex items-center justify-center gap-1.5 pt-0.5">
              <span className="text-white text-base font-extrabold tracking-tight">
                {maskedEmail}
              </span>

              <div className="bg-green-500 rounded-full p-0.5">
                <CheckCircle2
                  size={12}
                  className="text-[#050505] fill-current"
                />
              </div>
            </div>

            <p className="text-green-500 text-[9px] font-black uppercase tracking-widest mt-0.5">
              verified
            </p>

            {sentOtp && (
              <div className="mt-2.5 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-xl inline-flex flex-col items-center">
                <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest">Sent OTP (Testing)</span>
                <span className="text-sm font-mono font-black text-white">{sentOtp}</span>
              </div>
            )}
          </div>

          <InputOTP
            maxLength={6}
            value={otpValue}
            onChange={(val) => setOtpValue(val)}
          >
            <InputOTPGroup className="gap-1.5 flex w-full justify-between">
              {[...Array(6)].map((_, i) => (
                <InputOTPSlot
                  key={i}
                  index={i}
                  className={cn(
                    "h-10 w-10 sm:h-11 sm:w-11 rounded-lg border border-white/20 bg-white/[0.03] text-sm sm:text-base font-bold text-white transition-all duration-300",
                    "data-[active=true]:ring-2 data-[active=true]:ring-cyan-500/55 data-[active=true]:border-cyan-400"
                  )}
                />
              ))}
            </InputOTPGroup>
          </InputOTP>

          {verifyMutation.isError && (
            <p className="text-rose-500 text-xs font-semibold mt-3 text-center animate-pulse">
              {(verifyMutation.error as any)?.response?.data?.message || 
               (verifyMutation.error as any)?.response?.data?.error || 
               "Invalid OTP. Please try again."}
            </p>
          )}

          <div className="mt-4 flex items-center gap-1.5 bg-black/80 px-4 py-1.5 rounded-full border border-white/5 shadow-inner">
            <Clock
              size={14}
              className="text-[#f5a623]"
            />

            <span className="text-white/80 text-[11px]">
              Time remaining:
              <span className="font-mono ml-1">
                {formatTimer(timer)}
              </span>
            </span>
          </div>

          <div className="mt-4 text-center">
            <span className="text-white/40 text-[11px] block">
              Didn't receive code?
            </span>

            <Button
              variant="link"
              disabled={timer > 0}
              className="text-blue-400 text-xs font-semibold p-0 h-auto underline underline-offset-2 hover:text-blue-300 mt-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={async () => {
                if (timer > 0) return;
                if (email) {
                  try {
                    const data = await authApi.sendOtp(email, "login");
                    const receivedOtp = data?.otp || data?.code || data?.data?.otp || data?.data?.code;
                    if (receivedOtp) {
                      sessionStorage.setItem("vlm_sent_otp", String(receivedOtp));
                      setSentOtp(String(receivedOtp));
                    }
                  } catch (err) {
                    console.error("Failed to resend OTP", err);
                  }
                }
                setTimer(120);
              }}
            >
              Resend OTP
            </Button>
          </div>

          {/* Verify & Continue Button Inside Card */}
          <div className="mt-5 w-full relative">
            <div className="absolute inset-x-0 bottom-1 h-10 bg-blue-600/10 blur-[15px] rounded-full pointer-events-none" />
            <Button
              disabled={otpValue.length !== 6 || verifyMutation.isPending}
              onClick={handleVerify}
              className={cn(
                "relative w-full h-12 rounded-xl text-sm font-bold tracking-wide transition-all active:scale-[0.98]",
                "bg-gradient-to-r from-[#1e3a8e] to-[#0f172a] hover:brightness-110",
                "border border-blue-500/40 text-white shadow-xl"
              )}
            >
              {verifyMutation.isPending ? "VERIFYING..." : "Verify & Continue"}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Decorative Padding spacer for mobile scrolling */}
      <div className="h-6 shrink-0" />
    </div>
  );
}