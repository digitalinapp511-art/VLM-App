import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, ChevronRight } from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { toast } from "sonner";

import SessionSummaryCard from "@/components/basic/teacher/SessionSummaryCard";
import StarRating from "@/components/basic/teacher/StarRating";

const ResolveDoubtPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    sessionId = "CHAT-VLM-EL-29341",
    studentName = "Eleanor Reed",
    subjectName = "Physics",
    teacherName = "Dr. Elena Petrova",
    role = "Physics Faculty",
  } = location.state || {};

  const doubtId = sessionId.slice(-6).toUpperCase();

  const sessionSummary = 
    `Focus: ${subjectName} session completed. We covered core definitions, solved practice problems, and clarified the key questions. Keep reviewing to lock in the concepts!`;

  const handleResolve = () => {
    toast.success("Doubt successfully marked as Resolved!");
    navigate(PATHS.TEACHER_DASHBOARD);
  };

  return (
    <div className={cn("min-h-screen flex items-center justify-center p-4 relative overflow-hidden", bgCss)}>
      
      {/* Technical Background Decorative Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-10 h-full w-[1px] border-l border-dashed border-cyan-500/50" />
        <div className="absolute top-0 right-10 h-full w-[1px] border-l border-dashed border-cyan-500/50" />
        <div className="absolute top-14 right-16 text-[10px] font-mono text-cyan-500 tracking-widest uppercase">DATA</div>
        <div className="absolute bottom-10 left-10 w-2 h-2 bg-cyan-400 rounded-full blur-[2px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "w-full max-w-md p-6 rounded-[2.5rem] border border-cyan-500/40 backdrop-blur-3xl relative",
          "bg-gradient-to-br from-zinc-950/95 via-zinc-950/90 to-[#0a192f]/70",
          "shadow-[0_0_100px_rgba(34,211,238,0.1)]"
        )}
      >
        {/* Header Section */}
        <div className="flex flex-col items-center gap-3 mb-5">
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full" />
            <ShieldCheck size={44} className="text-white relative z-10" strokeWidth={1.5} />
          </div>
          
          <div className="text-center space-y-1">
            <h1 className="text-xl font-black text-white uppercase tracking-[0.05em]">
              Resolve Your Doubt
            </h1>
            <p className="text-zinc-500 text-[10px] font-bold tracking-widest uppercase opacity-80">
              Doubt #{doubtId}
            </p>
          </div>
        </div>

        {/* Summary Card Component */}
        <SessionSummaryCard 
          teacherName={teacherName}
          role={role}
          summary={sessionSummary}
          avatarUrl="https://api.dicebear.com/7.x/avataaars/svg?seed=Elena"
        />

        {/* Rating System Component */}
        <StarRating studentName={studentName} />

        {/* Action Button & Skip */}
        <div className="mt-4 flex flex-col items-center gap-3">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
            <Button 
              onClick={handleResolve}
              className={cn(
                "w-full h-13 rounded-[1.5rem] text-sm font-black uppercase tracking-widest cursor-pointer",
                "bg-gradient-to-r from-[#2b4b9b] to-[#1a2e5d] hover:brightness-110",
                "border border-cyan-400/20 shadow-[0_10px_40px_rgba(34,211,238,0.25)] text-white group"
              )}
            >
              Mark as Resolved
              <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />
            </Button>
          </motion.div>
          
          <button 
            onClick={() => navigate(PATHS.TEACHER_DASHBOARD)}
            className="text-cyan-400/80 hover:text-cyan-400 text-[12px] font-bold underline underline-offset-4 tracking-wide transition-all cursor-pointer bg-transparent border-none"
          >
            Skip for now
          </button>
        </div>

        {/* Footer Info */}
        <footer className="mt-5 text-center">
          <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest opacity-60">
            Session ID: {sessionId} | Student: {studentName}
          </p>
        </footer>
      </motion.div>
    </div>
  );
};

export default ResolveDoubtPage;