import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft,  UserCheck } from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import EligibilityCard from "@/components/basic/teacher/EligibilityCard";
import SupportCard from "@/components/basic/teacher/SupportCard";

const ApplicationStatus: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={cn("min-h-screen flex flex-col items-center p-4 md:p-8 bg-black", bgCss)}>
      {/* Constraints for Laptop/Tablet and Mobile */}
      <div className="w-full max-w-xl flex flex-col gap-6">
        
        {/* Navigation Header */}
        <header className="flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
             <span className="text-xl">🔥</span>
             <div className="space-y-0.5">
                <h1 className="text-xl font-black text-white uppercase tracking-tight leading-none">
                  Application Status
                </h1>
                <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.15em]">
                  Dr. Sarah Johnson | VLM-TR-1021
                </p>
             </div>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-zinc-800 bg-zinc-900 shadow-xl" />
        </header>

        <button 
          onClick={() => navigate(-1)}
          className="w-12 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-white hover:bg-zinc-800 transition-colors shadow-lg"
        >
          <ArrowLeft size={24} />
        </button>

        {/* Main Content Area */}
        <div className="space-y-6">
          <EligibilityCard />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Button 
              className={cn(
                "w-fit px-8 h-14 rounded-2xl border border-white/10 bg-zinc-900/40 text-zinc-300 font-bold uppercase tracking-widest text-xs",
                "flex items-center gap-3 hover:bg-zinc-800 hover:text-white transition-all shadow-xl"
              )}
            >
              <UserCheck size={20} />
              Edit Profile
            </Button>
          </motion.div>

          <SupportCard />
        </div>

        {/* Footer Info for Desktop */}
        <div className="mt-4 text-center">
            <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-widest">
                Teacher Support Division - Global Branch
            </p>
        </div>
      </div>
    </div>
  );
};

export default ApplicationStatus;