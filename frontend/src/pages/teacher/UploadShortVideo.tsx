import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  Pencil, 
  Users, 
  BookText, 
  BarChart3, 
  Globe, 
  MessageCircle, 
  Activity,
  ChevronRight
} from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { VideoInputField, VideoSelectField, VideoTextArea } from "@/components/basic/teacher/VideoFormFields";

const UploadShortVideo: React.FC = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { staggerChildren: 0.08, duration: 0.4 } 
    }
  };

  return (
    <div className={cn("min-h-screen flex flex-col items-center p-4 pb-12 relative overflow-x-hidden", bgCss)}>
      
      {/* App Bar */}
      <header className="w-full max-w-xl flex items-center py-6 mb-4">
        <button 
          onClick={() => navigate(-1)} 
          className="w-11 h-11 rounded-2xl bg-zinc-900/80 border border-white/10 flex items-center justify-center text-white relative shadow-xl"
        >
          <ChevronLeft size={22} />
          <div className="absolute -bottom-1 left-4 w-2 h-2 bg-zinc-900 border-r border-b border-white/10 rotate-45" />
        </button>
        <div className="flex-1 flex items-center justify-center gap-4 mr-11">
          <div className="w-8 h-8 rounded-full bg-blue-900/40 border border-blue-500/20" />
          <h1 className="text-sm font-black text-white uppercase tracking-widest">
            Upload Short Video
          </h1>
        </div>
      </header>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-xl space-y-4"
      >
        {/* Title Field */}
        <VideoInputField 
          label="Short Video Title" 
          value="Algebra in 3 Minutes: Quick Equations" 
          icon={Pencil} 
        />
        <div className="flex justify-end px-2">
            <span className="text-[9px] font-bold text-zinc-700">Max chars: 0 / 500</span>
        </div>

        {/* Multi-column Selection Area */}
        <div className="space-y-3">
          <div className="flex gap-3">
            <VideoSelectField label="Class" value="Grade 10" icon={Users} />
            <VideoSelectField label="Subject" value="Mathematics" icon={BookText} />
          </div>
          <div className="flex gap-3">
            <VideoSelectField label="Topic" value="Linear Equations" icon={BarChart3} active />
            <VideoSelectField label="Language" value="English" icon={Globe} />
          </div>
        </div>

        {/* Description */}
        <VideoTextArea 
          label="Describe your short video..." 
          value="A quick introduction to solving linear equations. We cover one-step and two-step methods..." 
          icon={MessageCircle} 
        />

        {/* Footer Info & Button Section */}
        <div className="pt-24 space-y-6">
          <p className="text-[10px] text-zinc-500 text-center font-medium leading-relaxed px-12">
            All short videos are reviewed by the VLM Content Team before publication.
          </p>

          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Button className={cn(
              "w-full h-16 rounded-full text-lg font-black uppercase tracking-widest gap-4 transition-all",
              "bg-gradient-to-r from-[#2b4b9b] via-[#1a2e5d] to-[#2b4b9b] bg-[length:200%_auto] hover:bg-right",
              "border border-cyan-400/30 shadow-[0_0_40px_rgba(34,211,238,0.2)] text-white"
            )}>
              <Activity size={24} className="text-zinc-200" />
              Submit For Review
              <ChevronRight size={20} className="ml-1 opacity-60" />
            </Button>
          </motion.div>

          <div className="text-center space-y-1">
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
              Uploader: Dr. Sarah Chen | ID: VLM-FA-01235
            </p>
            <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-tight">
              Video review typically takes up to 48 hours.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Decorative BG Accents */}
      <div className="fixed top-1/4 -right-10 w-40 h-40 bg-purple-500/5 blur-[100px] -z-10" />
      <div className="fixed bottom-1/4 -left-10 w-40 h-40 bg-cyan-500/5 blur-[100px] -z-10" />
    </div>
  );
};

export default UploadShortVideo;