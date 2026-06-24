import React from "react";
import { motion } from "framer-motion";
import { User, Video, MessageSquare, HelpCircle } from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";

import StatusBlob from "@/components/basic/teacher/StatusBlob";
import ReviewTimeline from "@/components/basic/teacher/ReviewTimeline";

const ProfileReviewStatus: React.FC = () => {
  return (
    <div className={cn("min-h-screen flex flex-col items-center bg-black", bgCss)}>
      {/* Laptop Optimization: Content centered and constrained */}
      <div className="w-full max-w-xl flex-1 flex flex-col px-4 md:px-0">
        
        {/* Header */}
        <header className="py-6 text-center">
          <h1 className="text-xl font-black text-white tracking-tight">VLM Academy</h1>
        </header>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 w-full bg-zinc-900/60 rounded-[48px] border border-white/5 backdrop-blur-2xl p-8 relative mb-8 flex flex-col"
        >
          <StatusBlob />

          <div className="text-center space-y-4 mb-10">
            <h2 className="text-3xl font-black text-white tracking-tight">
              Profile Under Review
            </h2>
            <p className="text-zinc-400 text-sm font-medium leading-relaxed px-2">
              Thank you for your application! Our team is currently reviewing your profile details. 
              We will notify you once the review is complete.
            </p>
          </div>

          <div className="mt-auto">
            <ReviewTimeline />
          </div>

          {/* Bottom Progress Pill */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-1 bg-white/40 rounded-full" />
        </motion.div>
      </div>

      {/* Persistent Bottom Navigation */}
      <nav className="w-full max-w-xl bg-black/80 border-t border-white/5 backdrop-blur-lg flex items-center justify-around py-4 px-6 fixed bottom-0">
        <NavItem icon={<User />} label="Profile" active />
        <NavItem icon={<Video />} label="Classes" />
        <NavItem icon={<MessageSquare />} label="Messages" />
        <NavItem icon={<HelpCircle />} label="Help" />
      </nav>
    </div>
  );
};

const NavItem = ({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
  <button className={cn(
    "flex flex-col items-center gap-1 transition-all duration-300",
    active ? "text-white" : "text-zinc-600 hover:text-zinc-400"
  )}>
    {React.cloneElement(icon, { size: 24, strokeWidth: active ? 2.5 : 1.5 })}
    <span className="text-[10px] font-bold tracking-tight">{label}</span>
  </button>
);

export default ProfileReviewStatus;