import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import {
  FileEdit, Send, CalendarCheck, UserSearch, ShieldCheck, Info, Star, ArrowLeft
} from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { teacherApi } from "@/lib/teacher-api";
import TimelineItem from "@/components/basic/teacher/TimelineItem";

const iconMap: Record<string, React.ReactNode> = {
  draft: <FileEdit />,
  submitted: <Send />,
  interview_scheduled: <CalendarCheck />,
  under_review: <UserSearch />,
  approved: <ShieldCheck />,
};

const VerificationStatus: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["teacherVerificationStatus"],
    queryFn: teacherApi.getVerificationStatus,
  });

  const currentStatus = data?.applicationStatus || "draft";

  const getStepStatus = (stepId: string): "completed" | "active" | "pending" => {
    const statusOrder = ["draft", "pending_interview", "interview_scheduled", "under_review", "approved"];
    
    // Normalize status mapping
    let normalizedCurrent = currentStatus;
    if (currentStatus === "submitted") normalizedCurrent = "pending_interview";
    if (currentStatus === "interview_pending") normalizedCurrent = "pending_interview";

    const currentIndex = statusOrder.indexOf(normalizedCurrent);
    const stepIndex = statusOrder.indexOf(stepId);

    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "active";
    return "pending";
  };

  const steps = [
    { id: "draft", title: "Profile Draft", description: "Fill out your details", status: getStepStatus("draft") },
    { id: "pending_interview", title: "Submitted", description: "Verification documents submitted", status: getStepStatus("pending_interview") },
    { id: "interview_scheduled", title: "Interview Status", description: "Verification interview scheduled", status: getStepStatus("interview_scheduled") },
    { id: "under_review", title: "Review", description: "Application review by admin", status: getStepStatus("under_review") },
    { id: "approved", title: "Approved", description: "Start teaching on VLM Academy!", status: getStepStatus("approved") },
  ];

  return (
    <div className={cn("min-h-screen flex flex-col items-center p-4 pb-32 sm:pb-40 relative overflow-hidden", bgCss)}>
      
      {/* Decorative Assets */}
      <div className="absolute top-1/4 -left-4 text-cyan-400/20 blur-[1px] rotate-45">
        <Star size={16} fill="currentColor" />
      </div>
      <div className="absolute top-[40%] -right-3 text-purple-500/30 blur-[1px]">
        <Star size={20} fill="currentColor" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "w-full max-w-[calc(100vw-32px)] sm:max-w-xl p-5 sm:p-8 rounded-3xl sm:rounded-[48px] border border-white/10 mt-2 sm:mt-6",
          "bg-white/[0.02] backdrop-blur-3xl shadow-2xl relative"
        )}
      >
        <header className="relative text-center mb-6 sm:mb-12">
          <button 
            onClick={() => navigate(PATHS.TEACHER_PROFILE)}
            className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/10 transition-all text-zinc-400 hover:text-white"
            title="Back to Profile"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2 px-10">
            Verification Status
          </h1>
          <p className="text-zinc-500 text-xs sm:text-sm font-medium tracking-wide">
            Keep track of your application progress.
          </p>
        </header>

        {/* Dynamic Interview Scheduled Panel */}
        {data?.interview && (data.interview.status === "scheduled" || data.interview.status === "rescheduled") && (
          <div className="mb-8 p-5 rounded-2xl border border-cyan-400/30 bg-cyan-400/5 text-center flex flex-col items-center gap-3">
            <h4 className="text-sm font-black text-white uppercase tracking-wider">
              Verification Interview Scheduled
            </h4>
            <p className="text-xs text-zinc-300">
              Your interview is booked for: <br />
              <strong className="text-cyan-400">
                {new Date(data.interview.scheduledAt).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </strong>
            </p>
            <Button
              onClick={() => navigate(`/teacher/interview-room/${data.interview._id}`)}
              className="mt-2 w-full h-11 rounded-full bg-cyan-400 text-black hover:bg-cyan-300 font-bold transition-all text-xs"
            >
              Join Interview Call Room
            </Button>
          </div>
        )}

        {/* Timeline Content */}
        <div className="px-1 sm:px-2 mb-6 sm:mb-12">
          {steps.map((step: any, index: number) => (
            <TimelineItem
              key={step.id}
              icon={iconMap[step.id] ?? <ShieldCheck />}
              title={step.title}
              description={step.description}
              status={step.status}
              isLast={index === steps.length - 1}
            />
          ))}
        </div>

        {/* Footer Info */}
        <div className="pt-6 sm:pt-8 border-t border-white/5 text-center">
          <p className="text-[9px] sm:text-[10px] text-zinc-600 font-bold tracking-widest uppercase">
            {isLoading
              ? "Loading..."
              : `Verification Status: ${data?.applicationStatus ?? "DRAFT"} | Applicant: ${data?.teacherName ?? "Teacher"}`}
          </p>
        </div>
      </motion.div>

      {/* Floating Action Button */}
      <div className="fixed bottom-0 left-0 w-full p-4 sm:p-8 flex justify-center bg-gradient-to-t from-black to-transparent pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[calc(100vw-32px)] sm:max-w-xl pointer-events-auto"
        >
          <Button
            variant="outline"
            className={cn(
              "w-full h-12 sm:h-14 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md",
              "text-zinc-300 font-bold flex items-center justify-center gap-3 hover:bg-white/5 transition-all text-xs sm:text-sm"
            )}
          >
            Have Questions? Contact Support
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-zinc-500 flex items-center justify-center shrink-0">
              <Info size={12} className="text-zinc-500" />
            </div>
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default VerificationStatus;