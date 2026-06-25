import RegistrationStepper from "@/components/basic/teacher/RegistrationStepper";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Monitor, Users, LayoutGrid, ChevronRight } from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { teacherApi } from "@/lib/teacher-api";
import { toast } from "sonner";
import { PATHS } from "@/routes/paths";

import ExperienceCounter from "@/components/basic/teacher/ExperienceCounter";
import ResumeUploadZone from "@/components/basic/teacher/ResumeUploadZone";
import { SelectionChip } from "@/components/basic/teacher/ModeSelector";

const TeacherExperienceDetails: React.FC = () => {
  const navigate = useNavigate();
  const [years, setYears] = useState(5);
  const [months, setMonths] = useState(8);
  const [mode, setMode] = useState("online");
  const [type, setType] = useState("school");
  const [summary, setSummary] = useState("");

  const handleContinue = () => navigate(PATHS.TEACHER_SUBJECT_SELECTION);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className={cn("min-h-screen flex flex-col items-center p-4 pb-12", bgCss)}>
      <RegistrationStepper currentStep={2} />

      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-white text-center mt-8 mb-10 tracking-tight"
      >
        Experience Details
      </motion.h1>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-xl space-y-4"
      >
        {/* Total Experience */}
        <motion.div variants={itemVariants} className="p-6 rounded-[32px] border border-white/10 bg-[#151515]/80 backdrop-blur-xl">
          <label className="block text-zinc-100 font-bold text-base mb-5">Total Experience</label>
          <div className="flex gap-4">
            <ExperienceCounter 
              value={years} label="Years" 
              onIncrement={() => setYears(v => v + 1)} 
              onDecrement={() => setYears(v => Math.max(0, v - 1))} 
            />
            <ExperienceCounter 
              value={months} label="Months" 
              onIncrement={() => setMonths(v => (v + 1) % 12)} 
              onDecrement={() => setMonths(v => (v - 1 + 12) % 12)} 
            />
          </div>
        </motion.div>

        {/* Teaching Mode */}
        <motion.div variants={itemVariants} className="p-6 rounded-[32px] border border-white/10 bg-[#151515]/80 backdrop-blur-xl">
          <label className="block text-zinc-100 font-bold text-base mb-5">Teaching Mode</label>
          <div className="flex flex-wrap gap-3">
            <SelectionChip 
              label="Online" icon={<Monitor size={18} />} 
              active={mode === "online"} onClick={() => setMode("online")} 
            />
            <SelectionChip 
              label="Offline" icon={<Users size={18} />} 
              active={mode === "offline"} onClick={() => setMode("offline")} 
            />
            <SelectionChip 
              label="Hybrid" icon={<LayoutGrid size={18} />} 
              active={mode === "hybrid"} onClick={() => setMode("hybrid")} 
            />
          </div>
        </motion.div>

        {/* Type of Experience */}
        <motion.div variants={itemVariants} className="p-6 rounded-[32px] border border-white/10 bg-[#151515]/80 backdrop-blur-xl">
          <label className="block text-zinc-100 font-bold text-base mb-5">Type of Experience</label>
          <div className="flex flex-wrap gap-3">
            <SelectionChip 
              label="School" variant="gold" 
              active={type === "school"} onClick={() => setType("school")} 
            />
            <SelectionChip 
              label="Home Tuition" variant="gold" 
              active={type === "home"} onClick={() => setType("home")} 
            />
            <SelectionChip 
              label="Online Platform" variant="gold" 
              active={type === "platform"} onClick={() => setType("platform")} 
            />
          </div>
        </motion.div>

        {/* Resume Upload */}
        <motion.div variants={itemVariants} className="p-6 rounded-[32px] border border-white/10 bg-[#151515]/80 backdrop-blur-xl">
          <label className="block text-zinc-100 font-bold text-base mb-5">Resume Upload</label>
          <ResumeUploadZone />
        </motion.div>

        {/* Experience Summary */}
        <motion.div variants={itemVariants} className="p-6 rounded-[32px] border border-white/10 bg-[#151515]/80 backdrop-blur-xl">
          <label className="block text-zinc-100 font-bold text-base mb-5">Short Experience Summary</label>
          <div className="relative rounded-3xl bg-black/40 border border-white/5 p-5">
            <textarea
              value={summary}
              onChange={e => setSummary(e.target.value)}
              maxLength={500}
              className="w-full h-36 bg-transparent text-zinc-300 text-[15px] focus:outline-none resize-none placeholder:text-zinc-600"
              placeholder="Write a short summary of your teaching achievements and methods..."
            />
            <div className="absolute bottom-4 right-5 text-[11px] font-mono text-zinc-500">
              {summary.length}/500
            </div>
          </div>
        </motion.div>

        {/* Progress Bar & CTA */}
        <motion.div variants={itemVariants} className="space-y-6 pt-4">
          <div className="w-full h-[3px] bg-zinc-800 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: "45%" }} className="h-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
          </div>
          <Button
            onClick={handleContinue}
            className={cn(
              "w-full h-16 rounded-[20px] text-xl font-bold uppercase tracking-tight transition-all",
              "bg-gradient-to-r from-[#2b4b9b] to-[#1a2e5d] hover:brightness-110",
              "border border-white/10 shadow-2xl text-white flex items-center justify-center gap-2"
            )}
          >
            Save & Continue <ChevronRight size={22} className="ml-1" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default TeacherExperienceDetails;