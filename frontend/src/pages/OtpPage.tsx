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
  const [timer, setTimer] = useState(58);
  const [sentOtp, setSentOtp] = useState<string | null>(
    sessionStorage.getItem("vlm_sent_otp")
  );

  const navigate = useNavigate();
  const verifyMutation = useVerifyOtp();

  const role = (sessionStorage.getItem("vlm_role") ??
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
                00:
                {timer < 10
                  ? `0${timer}`
                  : timer}
              </span>
            </span>
          </div>

          <div className="mt-4 text-center">
            <span className="text-white/40 text-[11px] block">
              Didn't receive code?
            </span>

            <Button
              variant="link"
              className="text-blue-400 text-xs font-semibold p-0 h-auto underline underline-offset-2 hover:text-blue-300 mt-0.5"
              onClick={async () => {
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
                setTimer(58);
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