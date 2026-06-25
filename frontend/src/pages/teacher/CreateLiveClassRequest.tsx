import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Mic, Calendar, Clock, Send, Star, Home, BookOpen, Wallet, Library, User } from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PATHS } from "@/routes/paths";

import { FormSection, FormSelect, SessionTypeToggle } from "@/components/basic/teacher/RequestFormComponents";

const CreateLiveClassRequest: React.FC = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className={cn("min-h-screen flex flex-col items-center p-4 pb-28 relative overflow-x-hidden", bgCss)}>
      
      {/* Decorative Icons */}
      <div className="absolute top-20 -left-2 text-blue-500/20 blur-[1px]">
        <Star size={16} fill="currentColor" />
      </div>
      <div className="absolute top-1/2 -right-4 text-purple-500/20 blur-[1px]">
        <Star size={24} fill="currentColor" />
      </div>

      {/* App Bar */}
      <header className="w-full max-w-xl flex items-center py-4 mb-4">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-white"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="flex-1 text-center text-sm font-black text-white uppercase tracking-widest mr-10">
          Create Live Class Request
        </h1>
      </header>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-xl space-y-6"
      >
        <motion.h2 variants={itemVariants} className="text-2xl font-black text-white text-center mb-2">
          Request New Live Session
        </motion.h2>

        {/* 1. Class Topic */}
        <motion.div variants={itemVariants}>
          <FormSection title="Class Topic">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Enter topic name" 
                className="w-full h-14 px-5 pr-12 rounded-2xl border border-white/10 bg-zinc-900/40 text-white placeholder:text-zinc-600 focus:outline-none"
              />
              <Mic size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500" />
            </div>
          </FormSection>
        </motion.div>

        {/* 2. Academic Details */}
        <motion.div variants={itemVariants}>
          <FormSection title="Academic Details">
            <div className="space-y-5">
              <FormSelect label="Subject" placeholder="Choose Subject" />
              <FormSelect label="Class" placeholder="Select Class" />
              <FormSelect label="Board" placeholder="Select Board" />
              <FormSelect label="Language" placeholder="Select Language" />
            </div>
          </FormSection>
        </motion.div>

        {/* 3. Schedule */}
        <motion.div variants={itemVariants}>
          <FormSection title="Schedule Date & Time">
            <div className="flex items-center gap-6 py-2">
              <div className="flex flex-col items-center gap-3">
                <div className="flex gap-1.5 items-center">
                  <div className="w-6 h-6 rounded-lg border border-zinc-800" />
                  <div className="w-6 h-6 rounded-lg border-2 border-cyan-400 bg-cyan-400/10" />
                  <div className="w-6 h-6 rounded-lg border border-zinc-800" />
                  <Calendar size={20} className="text-zinc-500 ml-1" />
                </div>
                <span className="text-[11px] font-bold text-zinc-500">Select Date</span>
              </div>
              
              <div className="w-[1px] h-10 bg-zinc-800" />

              <div className="flex flex-col items-center gap-3 flex-1">
                <div className="w-12 h-12 rounded-full border-2 border-blue-500 bg-blue-500/10 flex items-center justify-center">
                  <Clock size={20} className="text-blue-400" />
                </div>
                <span className="text-[11px] font-bold text-zinc-500">Select Time</span>
              </div>
            </div>
          </FormSection>
        </motion.div>

        {/* 4. Description */}
        <motion.div variants={itemVariants}>
          <FormSection title="Class Description">
            <div className="relative">
              <textarea 
                placeholder="Enter description for students..." 
                className="w-full h-32 p-5 rounded-2xl border border-white/10 bg-zinc-900/40 text-white placeholder:text-zinc-700 focus:outline-none resize-none"
              />
              <span className="absolute bottom-3 right-5 text-[9px] font-bold text-zinc-700">Char Count: 0 / 500</span>
            </div>
          </FormSection>
        </motion.div>

        {/* 5. Session Type */}
        <motion.div variants={itemVariants}>
          <FormSection title="Session Type">
            <SessionTypeToggle />
          </FormSection>
        </motion.div>

        {/* 6. Submit Button */}
        <motion.div variants={itemVariants} className="pt-4">
          <Button className={cn(
            "w-full h-20 rounded-full text-xl font-black uppercase tracking-widest gap-4 transition-all",
            "bg-zinc-950 border-2 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.25)] text-white hover:bg-zinc-900"
          )}>
            <Send size={24} className="fill-white" />
            Submit Request
          </Button>
        </motion.div>
      </motion.div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full bg-[#0a0a0a]/95 border-t border-white/5 backdrop-blur-lg px-6 py-4 flex items-center justify-between z-50">
        <NavItem icon={<Home />} label="Home" onClick={() => navigate(PATHS.TEACHER_DASHBOARD)} />
        <NavItem icon={<BookOpen />} label="Classes" active onClick={() => navigate(PATHS.TEACHER_CLASSES)} />
        <NavItem icon={<Wallet />} label="Wallet" onClick={() => navigate(PATHS.TEACHER_WALLET)} />
        <NavItem icon={<Library />} label="Library" onClick={() => navigate(PATHS.TEACHER_LIBRARY)} />
        <NavItem icon={<User />} label="Profile" onClick={() => navigate(PATHS.TEACHER_PROFILE)} />
      </nav>
    </div>
  );
};

const NavItem = ({ icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex flex-col items-center gap-1.5 transition-all duration-300",
      active ? "text-cyan-400" : "text-zinc-600 hover:text-zinc-400"
    )}
  >
    <div className={cn("relative", active && "drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]")}>
      {React.cloneElement(icon, { size: 24, strokeWidth: active ? 2.5 : 1.5 })}
    </div>
    <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    {active && <motion.div layoutId="navDot" className="w-1 h-1 rounded-full bg-cyan-400" />}
  </button>
);

export default CreateLiveClassRequest;