import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Star } from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { teacherApi } from "@/lib/teacher-api";
import { toast } from "sonner";
import { PATHS } from "@/routes/paths";

// import RegistrationStepper from "@/components/basic/teacher/RegistrationStepper";
import InstructionsCard from "@/components/basic/teacher/InstructionsCard";
import VideoPreviewCard from "@/components/basic/teacher/VideoPreviewCard";
import SubjectSelector from "@/components/basic/teacher/SubjectSelector";

const TeacherDemoVideo: React.FC = () => {
  const navigate = useNavigate();
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (videoFile) {
        await teacherApi.uploadDemoVideo(videoFile);
      }
      // Navigate to profile review regardless (video optional for dev)
      return true;
    },
    onSuccess: () => {
      toast.success("Demo video uploaded. Proceeding to review.");
      navigate(PATHS.PROFILE_REVIEW);
    },
    onError: () => toast.error("Video upload failed. Please try again."),
  });

  const handleVideoSelect = (file: File) => setVideoFile(file);
    <div className={cn("min-h-screen flex flex-col p-4 pb-12 relative overflow-x-hidden", bgCss)}>
      {/* Decorative Assets */}
      <div className="absolute top-24 -right-2 text-purple-500/30 blur-[1px]">
        <Star size={20} fill="currentColor" />
      </div>
      <div className="absolute bottom-[20%] -left-3 text-cyan-500/20 blur-[1px] rotate-45">
        <Star size={16} fill="currentColor" />
      </div>
      </div>

  return (
    <div className={cn("min-h-screen flex flex-col p-4 pb-12 relative overflow-x-hidden", bgCss)}>
      <div className="absolute top-24 -right-2 text-purple-500/30 blur-[1px]">
        <Star size={20} fill="currentColor" />
      </div>
      <div className="absolute bottom-[20%] -left-3 text-cyan-500/20 blur-[1px] rotate-45">
        <Star size={16} fill="currentColor" />
      </div>

      {/* <RegistrationStepper currentStep={3} /> */}

      <div className="max-w-xl mx-auto w-full space-y-6">
        <InstructionsCard />
        <VideoPreviewCard onFileSelect={handleVideoSelect} />
        <SubjectSelector />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-4">
          <Button
            onClick={() =>( uploadMutation.mutate(),navigate(PATHS.PROFILE_REVIEW) )}
            disabled={uploadMutation.isPending}
            className="w-full h-16 rounded-full text-lg font-black tracking-tighter uppercase transition-all flex items-center justify-center gap-3 bg-[#1A2E5D] hover:bg-[#254185] border border-blue-400/20 shadow-2xl text-white group"
          >
            {uploadMutation.isPending ? "Uploading..." : "Submit for Review"}
            <ChevronRight className="group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default TeacherDemoVideo;