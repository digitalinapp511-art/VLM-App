import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Pencil, MessageSquare, Star } from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { teacherApi } from "@/lib/teacher-api";
import { PATHS } from "@/routes/paths";

import RejectionStatusHeader from "@/components/basic/teacher/RejectionStatusHeader";
import RejectionDetailsCard from "@/components/basic/teacher/RejectionDetailsCard";
import ReapplicationCountdown from "@/components/basic/teacher/ReapplicationCountdown";

const ApplicationRejected: React.FC = () => {
  const navigate = useNavigate();

  useQuery({
    queryKey: ["teacherVerificationStatus"],
    queryFn: teacherApi.getVerificationStatus,
  });

  return (
    <div className={cn("min-h-screen flex flex-col p-4 pb-8 relative overflow-hidden", bgCss)}>
      {/* Decorative Icons */}
      <div className="absolute top-1/4 -left-4 text-cyan-400/20 blur-[1px] rotate-45">
        <Star size={16} fill="currentColor" />
      </div>
      <div className="absolute top-[40%] -right-3 text-purple-500/30 blur-[1px]">
        <Star size={20} fill="currentColor" />
      </div>
      <div className="absolute bottom-[30%] -left-3 text-cyan-500/20 blur-[1px]">
        <Star size={16} fill="currentColor" />
      </div>
      <div className="absolute bottom-20 right-8 text-zinc-600/30 blur-[1px]">
        <Star size={12} fill="currentColor" />
      </div>

      {/* App Bar */}
      <header className="flex items-center px-2 py-4 mb-2">
        <button onClick={() => navigate(-1)} className="p-2 text-zinc-400 hover:text-white transition-colors">
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1 flex items-center justify-center gap-3">
          <h1 className="text-lg font-black text-white tracking-tight">VLM Academy</h1>
          <span className="w-[1px] h-4 bg-zinc-700" />
          <span className="text-[13px] font-bold text-zinc-500 uppercase tracking-widest">Teacher Portal</span>
        </div>
      </header>

      <div className="max-w-xl mx-auto w-full">
        <RejectionStatusHeader />

        <RejectionDetailsCard />

        <ReapplicationCountdown />

        {/* Actions */}
        <div className="space-y-4 px-2">
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Button
              onClick={() => navigate(PATHS.BASICPROFILE_DETAILS)}
              className={cn(
                "w-full h-16 rounded-[2rem] text-[15px] font-black uppercase tracking-tight gap-3",
                "bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 transition-all",
                "border border-white/10 shadow-[0_10px_30px_rgba(220,38,38,0.3)]"
              )}>
              <Pencil size={20} className="fill-current" />
              Edit Profile & Address Feedback
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Button
              onClick={() => navigate(PATHS.COMING_SOON)}
              variant="outline"
              className={cn(
                "w-full h-16 rounded-[2rem] text-[15px] font-black uppercase tracking-tight gap-3",
                "bg-zinc-900/40 border-white/10 text-zinc-400 hover:bg-zinc-800 transition-all"
              )}>
              <MessageSquare size={20} />
              Contact Teacher Support
            </Button>
          </motion.div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center">
          <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-widest">
            VLM Academy Teacher Portal - Onboarding Status System
          </p>
        </footer>
      </div>
    </div>
  );
};

export default ApplicationRejected;