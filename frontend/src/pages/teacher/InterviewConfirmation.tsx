import React from "react";
import { motion } from "framer-motion";
import { Video, Star } from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import ConfirmationStatus from "@/components/basic/teacher/ConfirmationStatus";
import MeetingDetailsCard from "@/components/basic/teacher/MeetingDetailsCard";
import InterviewInstructionsCard from "@/components/basic/teacher/InterviewInstructionsCard";
import { PATHS } from "@/routes/paths";
import { useNavigate } from "react-router";

const InterviewConfirmation: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className={cn("min-h-screen flex flex-col p-4 pb-20 relative overflow-hidden", bgCss)}>
      {/* Decorative Icons */}
      <div className="absolute top-1/4 -left-4 text-cyan-400/20 blur-[1px] rotate-45">
        <Star size={16} fill="currentColor" />
      </div>
      <div className="absolute top-[40%] -right-3 text-purple-500/30 blur-[1px]">
        <Star size={20} fill="currentColor" />
      </div>
      <div className="absolute bottom-[25%] -left-3 text-cyan-500/20 blur-[1px]">
        <Star size={16} fill="currentColor" />
      </div>
      <div className="absolute bottom-[15%] -right-2 text-zinc-600/30 blur-[1px]">
        <Star size={12} fill="currentColor" />
      </div>

      <header className="mt-8 mb-4 text-center">
        <h1 className="text-2xl font-black text-white uppercase tracking-widest">
          Interview Confirmation
        </h1>
      </header>

      <div className="max-w-xl  mx-auto w-full space-y-4">
        <ConfirmationStatus />
<h2 className="text-lg font-bold text-white cursor-pointer" onClick={() => navigate(PATHS.TEACHER_DASHBOARD)}>
          Goto Dashboard
        </h2>
        {/* Meeting Details */}
        <MeetingDetailsCard />

        {/* Status History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-[28px] border border-white/10 bg-white/[0.03] backdrop-blur-md"
        >
          <h3 className="text-base font-bold text-zinc-100 mb-4 border-b border-white/5 pb-3">
            Status History
          </h3>
          <p className="text-sm font-medium text-zinc-500 italic px-2">
            (e.g., Showing scheduling confirmed and verification in progress)
          </p>
        </motion.div>

        {/* Instructions */}

        <InterviewInstructionsCard />
      </div>

      {/* Floating Footer Section */}
      <div className="fixed bottom-0 left-0 w-full p-8 flex flex-col items-center bg-gradient-to-t from-black to-transparent pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl pointer-events-auto"
        >
          <Button className={cn(
            "w-full h-16 rounded-full text-lg font-black tracking-tighter uppercase transition-all flex items-center justify-center gap-3",
            "bg-gradient-to-r from-[#2b4b9b] to-[#1a2e5d] hover:bg-[#254185]",
            "border border-blue-400/20 shadow-[0_0_30px_rgba(59,130,246,0.3)] text-white group"
          )}>
            <Video size={24} fill="currentColor" />
            Join Interview
          </Button>
          
          {/* <div className="text-center mt-4 space-y-0.5">
            <p className="text-[10px] text-zinc-600 font-bold tracking-tight">
              Button active 15 mins before start time.
            </p>
            <p className="text-[10px] text-zinc-600 font-bold tracking-tight">
              Confirmation email sent. Verification ongoing.
            </p>
          </div> */}
        </motion.div>

      </div>

    </div>
  );
};

export default InterviewConfirmation;
