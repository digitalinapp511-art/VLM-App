import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Calendar, FileClock, ChevronRight, Star, Loader2 } from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import SchedulingCalendar from "@/components/basic/teacher/SchedulingCalendar";
import TimeSlotGrid from "@/components/basic/teacher/TimeSlotGrid";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { useMutation } from "@tanstack/react-query";
import { teacherApi } from "@/lib/teacher-api";
import { toast } from "sonner";

const InterviewScheduling: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("10:00 AM");

  const scheduleMutation = useMutation({
    mutationFn: teacherApi.scheduleInterviewSlot,
    onSuccess: () => {
      toast.success("Interview scheduled successfully!");
      navigate(PATHS.VERIFICATION_STATUS);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to schedule interview");
    },
  });

  const handleConfirmSchedule = () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Please select a date and time slot");
      return;
    }

    const dateStr = selectedDate.toISOString().split("T")[0];
    const fullScheduledAt = new Date(`${dateStr} ${selectedTime}`).toISOString();

    scheduleMutation.mutate({
      scheduledAt: fullScheduledAt,
      teacherNotes: `Requested slot: ${selectedDate.toDateString()} at ${selectedTime}`,
      type: "onboarding",
    });
  };

  return (
    <div className={cn("min-h-screen flex flex-col p-4 md:p-8 lg:p-12 relative overflow-x-hidden", bgCss)}>
      
      {/* Decorative Elements - Hidden on small screens if too cluttered */}
      <div className="absolute top-40 -left-10 text-cyan-400/10 blur-[2px] hidden lg:block">
        <Star size={40} fill="currentColor" />
      </div>
      <div className="absolute bottom-20 -right-10 text-purple-500/20 blur-[2px] hidden lg:block">
        <Star size={60} fill="currentColor" />
      </div>

      <div className="max-w-7xl mx-auto w-full">
        {/* Header - Adaptive Layout */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6"
        >
          <div className="space-y-4">
            <button 
              type="button" 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group"
            >
              <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-semibold uppercase tracking-widest">Back</span>
            </button>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight uppercase tracking-tighter">
              Interview<br className="hidden md:block" /> Scheduling
            </h1>
          </div>

          {/* Top Right Visual Card */}
          <div className="p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md hidden sm:flex items-center gap-4">
            <div className="relative p-2 rounded-xl border border-white/20 bg-zinc-900/80">
              <div className="w-12 h-8 border border-white/30 rounded flex items-center justify-around">
                <div className="w-3 h-3 rounded-full border border-white/50" />
                <div className="w-3 h-3 rounded-full border border-white/50" />
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-1 bg-[#22d3ee] rounded-full blur-[1px]" />
            </div>
            <div className="text-left">
                <p className="text-white font-bold text-sm">Agora Video Meeting</p>
                <p className="text-zinc-500 text-xs font-medium">1-on-1 Admin Verification</p>
            </div>
          </div>
        </motion.header>

        {/* Main Content Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 items-start">
          
          {/* Left Column: Selection & Summary */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -30 }} 
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <SchedulingCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="flex items-center justify-between p-6 rounded-[24px] border border-white/10 bg-white/[0.03] backdrop-blur-md"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                    <Calendar size={24} />
                </div>
                <p className="text-base font-medium text-zinc-400">
                  Selected Slot: <br className="md:hidden" />
                  <span className="text-white font-bold ml-1">
                    {selectedDate.toDateString()} at {selectedTime}
                  </span>
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Time Slots & CTA */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: 30 }} 
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <TimeSlotGrid selectedTime={selectedTime} onSelectTime={setSelectedTime} />
            </motion.div>

            {/* CTA Button */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.4 }}
              className="pt-4"
            >
              <Button 
                onClick={handleConfirmSchedule}
                disabled={scheduleMutation.isPending} 
                className="w-full h-16 md:h-20 rounded-[28px] text-lg md:text-xl font-bold tracking-tight bg-gradient-to-r from-[#2b4b9b] to-[#1a2e5d] hover:brightness-110 border border-blue-400/20 shadow-2xl flex items-center justify-center gap-4 group transition-all text-white cursor-pointer"
              >
                {scheduleMutation.isPending ? (
                  <Loader2 className="animate-spin w-6 h-6" />
                ) : (
                  <>
                    CONFIRM & SCHEDULE INTERVIEW
                    <div className="bg-white/10 p-2 rounded-full group-hover:translate-x-1 transition-transform">
                      <ChevronRight size={24} />
                    </div>
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Spacing for mobile fixed footer overlap if any */}
      <div className="h-10 lg:hidden" />
    </div>
  );
};

export default InterviewScheduling;