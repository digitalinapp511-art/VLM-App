import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Monitor, Users, LayoutGrid, ChevronRight } from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { teacherApi } from "@/lib/teacher-api";
import { toast } from "sonner";
import { PATHS } from "@/routes/paths";

import RegistrationStepper from "@/components/basic/teacher/RegistrationStepper";
import ExperienceCounter from "@/components/basic/teacher/ExperienceCounter";
import ResumeUploadZone from "@/components/basic/teacher/ResumeUploadZone";
import { SelectionChip } from "@/components/basic/teacher/ModeSelector";

const TeacherExperienceDetails: React.FC = () => {
  const navigate = useNavigate();
  const [years, setYears] = useState(0);
  const [months, setMonths] = useState(0);
  const [mode, setMode] = useState("");
  const [types, setTypes] = useState<string[]>([]);
  const [summary, setSummary] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [isUploadingResume, setIsUploadingResume] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["teacherProfile"],
    queryFn: teacherApi.getProfile,
    retry: false,
  });

  useEffect(() => {
    if (profile) {
      if (profile.experience) {
        const exp = profile.experience;
        if (exp.totalYears !== undefined) {
          setYears(Math.floor(exp.totalYears));
          setMonths(Math.round((exp.totalYears - Math.floor(exp.totalYears)) * 12));
        }
        if (exp.teachingModes && exp.teachingModes.length > 0) {
          setMode(exp.teachingModes[0]);
        }
        if (exp.experienceTypes && Array.isArray(exp.experienceTypes)) {
          setTypes(exp.experienceTypes);
        }
        if (exp.summary) {
          setSummary(exp.summary);
        }
        if (exp.resumeUrl) {
          setResumeUrl(exp.resumeUrl);
          const parts = exp.resumeUrl.split("/");
          setResumeFileName(parts[parts.length - 1] || "Resume");
        }
      }
      if (profile.uploadedDocuments) {
        const resumeDoc = profile.uploadedDocuments.find((d: any) => d.type === "resume");
        if (resumeDoc) {
          setResumeUrl(resumeDoc.url);
          setResumeFileName(resumeDoc.name);
        }
      }
    }
  }, [profile]);

  const toggleType = (t: string) => {
    if (types.includes(t)) {
      setTypes(types.filter((item) => item !== t));
    } else {
      setTypes([...types, t]);
    }
  };

  const handleUploadResume = async (file: File) => {
    setIsUploadingResume(true);
    try {
      const response = await teacherApi.uploadDocument(file, "resume", file.name);
      if (response && response.url) {
        setResumeUrl(response.url);
        setResumeFileName(file.name);
        toast.success("Resume uploaded successfully!");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to upload resume");
    } finally {
      setIsUploadingResume(false);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      return teacherApi.updateProfile({ experience: payload });
    },
    onSuccess: () => {
      toast.success("Experience details saved successfully!");
      navigate(PATHS.TEACHER_SUBJECT_SELECTION);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.response?.data?.error || "Failed to save experience details");
    }
  });

  const handleContinue = () => {
    if (!mode) {
      toast.error("Please select a teaching mode");
      return;
    }
    if (!types || types.length === 0) {
      toast.error("Please select at least one type of experience");
      return;
    }
    if (!resumeUrl) {
      toast.error("Please upload your resume");
      return;
    }

    const totalYears = years + (months / 12);
    saveMutation.mutate({
      totalYears: parseFloat(totalYears.toFixed(2)),
      isFresher: totalYears === 0,
      teachingModes: [mode],
      experienceTypes: types,
      summary: summary,
      resumeUrl: resumeUrl
    });
  };

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
      <RegistrationStepper currentStep={3} />

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
          <label className="block text-zinc-100 font-bold text-base mb-5 flex items-center">
            Total Experience <span className="text-red-500 font-bold ml-1">*</span>
          </label>
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
          <label className="block text-zinc-100 font-bold text-base mb-5 flex items-center">
            Teaching Mode <span className="text-red-500 font-bold ml-1">*</span>
          </label>
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
          <label className="block text-zinc-100 font-bold text-base mb-5 flex items-center">
            Type of Experience <span className="text-red-500 font-bold ml-1">*</span>
          </label>
          <div className="flex flex-wrap gap-3">
            <SelectionChip 
              label="School" variant="gold" 
              active={types.includes("school")} onClick={() => toggleType("school")} 
            />
            <SelectionChip 
              label="Home Tuition" variant="gold" 
              active={types.includes("home")} onClick={() => toggleType("home")} 
            />
            <SelectionChip 
              label="Online Platform" variant="gold" 
              active={types.includes("platform")} onClick={() => toggleType("platform")} 
            />
          </div>
        </motion.div>

        {/* Resume Upload */}
        <motion.div variants={itemVariants} className="p-6 rounded-[32px] border border-white/10 bg-[#151515]/80 backdrop-blur-xl">
          <label className="block text-zinc-100 font-bold text-base mb-5 flex items-center">
            Resume Upload <span className="text-red-500 font-bold ml-1">*</span>
          </label>
          <ResumeUploadZone 
            fileName={resumeFileName} 
            onUpload={handleUploadResume} 
            isUploading={isUploadingResume} 
          />
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

        {/* CTA Button without the yellow line */}
        <motion.div variants={itemVariants} className="pt-4">
          <Button
            onClick={handleContinue}
            disabled={saveMutation.isPending}
            className={cn(
              "w-full h-16 rounded-[20px] text-xl font-bold uppercase tracking-tight transition-all",
              "bg-gradient-to-r from-[#2b4b9b] to-[#1a2e5d] hover:brightness-110",
              "border border-white/10 shadow-2xl text-white flex items-center justify-center gap-2"
            )}
          >
            {saveMutation.isPending ? "Saving..." : "Save & Continue"} <ChevronRight size={22} className="ml-1" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default TeacherExperienceDetails;