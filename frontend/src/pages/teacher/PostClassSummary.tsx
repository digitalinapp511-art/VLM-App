import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  Users, 
  Clock, 
  Star, 
  Trophy, 
  Video, 
  MessageSquare,
  CheckCircle2
} from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";

import AnalyticsCard from "@/components/basic/teacher/AnalyticsCard";
import FeedbackList from "@/components/basic/teacher/FeedbackList";

const PostClassSummary: React.FC = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  return (
    <div className={cn("min-h-screen flex flex-col items-center p-4 pb-12", bgCss)}>
      <div className="w-full max-w-xl space-y-6">
        
        {/* Header Section */}
        <header className="flex items-start gap-4 py-4">
          <button 
            onClick={() => navigate(-1)} 
            className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-white shrink-0 shadow-xl"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex-1 space-y-1 pt-1">
            <h1 className="text-xl font-black text-[#00f2fe] uppercase tracking-widest leading-tight">
              Post-Class Summary <br /> & Analytics
            </h1>
          </div>
        </header>

        {/* Class Info & Status */}
        <div className="space-y-4 px-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-sm font-black text-white uppercase tracking-widest">Advanced Calculus</span>
              <span className="w-[1px] h-4 bg-zinc-700" />
              <span className="text-[11px] font-bold text-zinc-500 uppercase">Section C</span>
            </div>
            <div className="px-4 py-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/5">
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Class Completed</span>
            </div>
          </div>
          <p className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest text-center">
            Completed: Oct 15, 2024 | 9:00 AM
          </p>
        </div>

        {/* Analytics Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-3 gap-3"
        >
          <AnalyticsCard 
            icon={<Users />} 
            label="Attendance:" 
            value="42/45" 
            subValue={
              <div className="flex flex-col items-center gap-1">
                <span>(93%)</span>
                <div className="flex gap-0.5 text-emerald-500">
                  <CheckCircle2 size={10} />
                  <CheckCircle2 size={10} />
                  <CheckCircle2 size={10} />
                </div>
              </div>
            } 
          />
          <AnalyticsCard 
            icon={<Clock />} 
            label="Duration:" 
            value="58 MINS" 
          />
          <AnalyticsCard 
            icon={<Star className="fill-current" />} 
            label="Class Rating:" 
            value="4.8" 
            variant="cyan"
            subValue={
              <div className="flex flex-col items-center gap-1">
                <div className="flex gap-0.5 text-cyan-400">
                   {[...Array(3)].map((_, i) => <Star key={i} size={10} fill="currentColor" />)}
                </div>
                <span>/ 5.0 ★</span>
              </div>
            }
          />
          <AnalyticsCard 
            icon={<Trophy />} 
            label="VLM Faculty Points Earned" 
            value="+150" 
            variant="blue"
          />
          <AnalyticsCard 
            icon={<Video />} 
            label="Uploaded to Faculty Library & VLM Cloud" 
            value="SAVED" 
            variant="cyan"
            className="flex-col-reverse"
            subValue={
                <div className="space-y-1 mb-2">
                    <div className="flex items-center justify-center gap-1 text-[9px] font-black text-white">
                        SESSION <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    </div>
                    <p className="text-[9px] font-black text-white">RECORDING</p>
                </div>
            }
          />
          <AnalyticsCard 
            icon={<MessageSquare className="fill-current" />} 
            label="Total Student Questions:" 
            value="12" 
          />
        </motion.div>

        {/* Feedback List */}
        <FeedbackList />

      </div>
    </div>
  );
};

export default PostClassSummary;