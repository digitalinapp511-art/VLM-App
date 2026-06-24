import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Pencil, ListTodo, Star } from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import SessionInfoCard from "@/components/basic/teacher/SessionInfoCard";
import EngagementChips from "@/components/basic/teacher/EngagementChips";

const TeacherSessionCompletion: React.FC = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className={cn("min-h-screen flex flex-col p-4 pb-12 relative overflow-x-hidden", bgCss)}>
      {/* Decorative Orbs */}
      <div className="absolute top-40 -left-10 w-40 h-40 bg-purple-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-40 -right-10 w-40 h-40 bg-yellow-500/10 blur-[100px] pointer-events-none" />

      {/* App Bar */}
      <header className="w-full max-w-xl mx-auto flex items-center py-4 mb-4">
        <button onClick={() => navigate(-1)} className="text-zinc-400 hover:text-white transition-colors">
          <ChevronLeft size={28} strokeWidth={2} />
        </button>
        <div className="flex-1 flex flex-col items-center">
          <h1 className="text-2xl font-black text-white leading-none tracking-tight">
            Teacher Session
          </h1>
          <p className="text-2xl font-black text-white tracking-tight">
            Completion
          </p>
        </div>
        <Avatar className="w-11 h-11 border-2 border-white/10">
          <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher" />
          <AvatarFallback>TH</AvatarFallback>
        </Avatar>
      </header>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-xl mx-auto space-y-6"
      >
        <motion.div variants={itemVariants}>
          <SessionInfoCard />
        </motion.div>

        {/* Summary Input */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-[15px] font-black text-zinc-100 tracking-tight">Session Summary</h4>
            <Pencil size={18} className="text-zinc-600" />
          </div>
          <div className="relative">
            <div className="w-full p-6 rounded-[28px] border border-white/10 bg-white/[0.01] backdrop-blur-md">
              <p className="text-[13px] text-zinc-400 font-medium leading-relaxed">
                Focused on friction coefficients and multiple force diagrams. Good progress made on complex scenarios. See notes.
              </p>
            </div>
            <p className="text-right text-[9px] font-bold text-zinc-700 mt-2 uppercase tracking-widest">
              Character count
            </p>
          </div>
        </motion.div>

        {/* Follow-up Notes */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-[15px] font-black text-zinc-100 tracking-tight">Key Notes for Follow-up</h4>
            <ListTodo size={18} className="text-zinc-600" />
          </div>
          <div className="w-full p-6 rounded-[28px] border border-white/10 bg-white/[0.01]">
            <ul className="space-y-2 text-[13px] text-zinc-400 font-medium list-disc list-inside marker:text-zinc-600">
              <li>Review free-body diagrams for inclined planes.</li>
              <li>Practice problems involving kinetic friction on multiple surfaces.</li>
            </ul>
          </div>
          <p className="text-right text-[9px] font-bold text-zinc-700 uppercase tracking-widest">
            Max chars
          </p>
        </motion.div>

        {/* Rating Section */}
        <motion.div variants={itemVariants} className="space-y-5 py-4">
          <h4 className="text-[15px] font-black text-white text-center uppercase tracking-widest">
            Student Behaviour & Engagement Rating
          </h4>
          <EngagementChips />
          
          <div className="flex flex-col items-center gap-3 pt-2">
            <motion.div 
               animate={{ scale: [1, 1.1, 1] }} 
               transition={{ repeat: Infinity, duration: 3 }}
            >
              <Star size={32} className="text-cyan-400 fill-cyan-400/20" strokeWidth={1.5} />
            </motion.div>
            <p className="text-[13px] font-bold text-zinc-400">
              Overall Behaviour: <span className="text-white">4.5 / 5.0 ★</span> | <span className="text-emerald-500 uppercase tracking-widest">Excellent!</span>
            </p>
          </div>
        </motion.div>

        {/* Submit Action */}
        <motion.div variants={itemVariants} className="pt-2">
          <Button className={cn(
            "w-full h-20 rounded-[2.5rem] text-xl font-black uppercase tracking-widest gap-2 transition-all",
            "bg-gradient-to-r from-[#2b4b9b] via-[#1e3a7a] to-[#2b4b9b] bg-[length:200%_auto] hover:bg-right",
            "border border-blue-400/30 shadow-[0_10px_40px_rgba(30,58,138,0.3)]"
          )}>
            **Submit Completion <span className="text-2xl font-light opacity-50">&gt;</span>
          </Button>
        </motion.div>

        {/* Footer Disclaimer */}
        <footer className="text-center px-8">
           <p className="text-[10px] text-zinc-700 font-bold leading-tight uppercase tracking-tight">
              Completion form handled by VLM Academy Teacher Portal Team. See details. <br />
              VLM Academy - Teacher Portal - Wrap-up Workflow
           </p>
        </footer>
      </motion.div>
    </div>
  );
};

export default TeacherSessionCompletion;