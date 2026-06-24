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

function resolvePostOtpPath(role: Role, isNewUser: boolean): string {
  if (role === "parent" || role === "teacher") {
    return PATHS.TEACHER_REGISTRATION;
  }

  return isNewUser
    ? PATHS.CREATE_PROFILE
    : PATHS.STUDENT_DASHBOARD;
}

export default function OtpVerificationPage() {
  const [otpValue, setOtpValue] = useState("");
  const [timer, setTimer] = useState(58);

  const navigate = useNavigate();
  const verifyMutation = useVerifyOtp();

  const role = (sessionStorage.getItem("vlm_role") ??
    "student") as Role;

  const phone =
    sessionStorage.getItem("vlm_phone") || "";
  const maskedPhone = phone
    ? phone.replace(
        /(\+91)(\d{2})\d{4}(\d{4})/,
        "$1 $2****$3"
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

    const phone =
      sessionStorage.getItem("vlm_phone") ??
      "+919999999999";

    verifyMutation.mutate(
      {  identifier:phone,  otp: otpValue },
      {
        onSuccess: (data: VerifyOtpResponse) => {
          navigate(resolvePostOtpPath(role, data.isNewUser), { replace: true });
        },
      }
    );
  };

  return (
    <div className="relative vlm-bg-navy flex min-h-svh w-full flex-col items-center bg-[#050505] px-6 overflow-hidden">
      <BackgroundElement />

      <VlmWordmark role={role} />

      <div className="relative z-10 mt-8 text-center space-y-4">
        <h2 className="text-3xl text-white tracking-tight">
          Verification Required
        </h2>

        <p className="text-white/50 text-[15px] leading-relaxed max-w-[280px] mx-auto">
          We've sent a 6-digit code to your mobile
          number.
        </p>
      </div>

      <Card className="relative z-10 mt-8 w-full max-w-[420px] border-white/10 bg-[#1a1a1a]/40 backdrop-blur-2xl rounded-[2.5rem] py-10 shadow-2xl">
        <CardContent className="flex flex-col items-center">
          <div className="text-center space-y-1 mb-8">
            <h3 className="text-white/90 text-base font-medium">
              Verify your Mobile
            </h3>

            <div className="flex items-center justify-center gap-2">
              <span className="text-white text-xl font-bold tracking-tight">
                {maskedPhone}
              </span>

              <div className="bg-green-500 rounded-full p-0.5">
                <CheckCircle2
                  size={16}
                  className="text-[#050505] fill-current"
                />
              </div>
            </div>

            <p className="text-green-500 text-[10px] font-bold uppercase tracking-widest mt-1">
              verified
            </p>
          </div>

          <InputOTP
            maxLength={6}
            value={otpValue}
            onChange={(val) => setOtpValue(val)}
          >
            <InputOTPGroup className="gap-2">
              {[...Array(6)].map((_, i) => (
                <InputOTPSlot
                  key={i}
                  index={i}
                  className={cn(
                    "h-14 w-14 rounded-2xl border-none bg-[#333]/50 text-xl font-bold text-white transition-all duration-300",
                    "data-[active=true]:ring-2 data-[active=true]:ring-indigo-500/50"
                  )}
                />
              ))}
            </InputOTPGroup>
          </InputOTP>

          <div className="mt-6 flex items-center gap-2 bg-black/80 px-6 py-2.5 rounded-full border border-white/5 shadow-inner">
            <Clock
              size={16}
              className="text-[#f5a623]"
            />

            <span className="text-white/90 text-[13px]">
              Time remaining:
              <span className="font-mono ml-1">
                00:
                {timer < 10
                  ? `0${timer}`
                  : timer}
              </span>
            </span>
          </div>

          <div className="mt-8 text-center space-y-1">
            <p className="text-white/50 text-sm">
              Didn't receive code?
            </p>

            <Button
              variant="link"
              className="text-blue-400 font-medium p-0 h-auto underline underline-offset-4 hover:text-blue-300"
              onClick={() => {
                if (phone) authApi.sendOtp({ phone, role });
                setTimer(58);
              }}
            >
              Resend OTP
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-auto w-full max-w-[400px] p-8 relative">
        <div className="absolute inset-x-0 bottom-10 h-16 bg-blue-600/30 blur-[40px] rounded-full" />

        <Button
          disabled={
            otpValue.length !== 6 ||
            verifyMutation.isPending
          }
          onClick={handleVerify}
          className={cn(
            "relative w-full h-16 rounded-[2rem] text-lg font-bold tracking-wide transition-all active:scale-[0.98]",
            "bg-gradient-to-b from-[#1e3a8e] to-[#0f172a]",
            "border border-blue-500/40 text-white shadow-xl"
          )}
        >
          {verifyMutation.isPending
            ? "Verifying..."
            : "Verify & Continue"}
        </Button>
      </div>
    </div>
  );
}