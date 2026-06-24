import React from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const OTPField: React.FC = () => {
  return (
    <div className="flex flex-col gap-3 py-2">
      <div className="flex justify-between items-center px-1">
        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">OTP sent via SMS</span>
      </div>
      
      <InputOTP maxLength={6} containerClassName="justify-between gap-2">
        <InputOTPGroup className="gap-2 w-full">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <InputOTPSlot
              key={index}
              index={index}
              className="flex-1 h-16 rounded-xl border border-white/10 bg-zinc-900/40 text-2xl font-bold text-white transition-all data-[active=true]:border-cyan-400 data-[active=true]:ring-2 data-[active=true]:ring-cyan-400/20 data-[active=true]:shadow-[0_0_15px_rgba(34,211,238,0.3)]"
            />
          ))}
        </InputOTPGroup>
      </InputOTP>

      <div className="flex justify-between items-center px-1 mt-1">
        <span className="text-[11px] font-medium text-zinc-500">Enter 6-digit Code</span>
        <button className="text-[11px] font-bold text-zinc-400 underline underline-offset-4 hover:text-zinc-200 transition-colors">
          Didn't receive code?
        </button>
      </div>
    </div>
  );
};

export default OTPField;