import React from "react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import InvalidReferralCard from "@/components/basic/teacher/InvalidReferralCard";
const InvalidReferralStatus: React.FC = () => {
  return (
    <div className={cn("min-h-screen flex flex-col items-center bg-black p-4 md:p-8", bgCss)}>
      {/* App Header Wrapper - Laptop Optimized */}
      <div className="w-full max-w-xl flex items-center justify-between py-6">
        <div className="flex items-center gap-3">
          {/* Logo Placeholder */}
          <div className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center shrink-0">
             <div className="w-6 h-6 border-4 border-zinc-100 rounded-sm" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-[17px] font-black text-white leading-none tracking-tight">
              VLM Academy
            </h1>
            <p className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
              Teacher App
            </p>
          </div>
        </div>

        {/* Profile/Avatar Placeholder */}
        <div className="w-11 h-11 rounded-full border-2 border-zinc-800 shadow-xl bg-zinc-900 overflow-hidden" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-xl flex flex-col justify-center pb-20">
        <InvalidReferralCard
          userName="Placeholder Name"
          onViewRules={() => console.log("Viewing Rules")}
          onContactSupport={() => console.log("Contacting Support")}
        />
      </div>

      {/* Decorative background light for laptop view */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[60%] bg-amber-500/[0.02] blur-[120px] pointer-events-none -z-20 hidden lg:block" />
    </div>
  );
};

export default InvalidReferralStatus;