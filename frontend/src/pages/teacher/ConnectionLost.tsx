import React, { useState } from "react";
import { motion } from "framer-motion";
import { Home, Calendar, MessageSquare, LogOut } from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";

import ConnectionIllustration from "@/components/basic/teacher/ConnectionIllustration";
import RetryButton from "@/components/basic/teacher/RetryButton";

const ConnectionLost: React.FC = () => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = () => {
    setIsRetrying(true);
    // Simulate network check
    setTimeout(() => setIsRetrying(false), 2000);
  };

  return (
    <div className={cn("min-h-screen flex flex-col p-4 pb-24 relative overflow-x-hidden bg-black", bgCss)}>
      
      {/* App Header */}
      <header className="flex items-center gap-4 py-8 px-2">
        <div className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center shrink-0">
          {/* Logo Placeholder */}
          <div className="w-8 h-8 border-4 border-zinc-200 rounded-md" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl font-black text-white leading-tight">VLM Academy</h1>
          <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Teacher App</p>
        </div>
      </header>

      {/* Main Error Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "w-full max-w-xl mx-auto p-10 rounded-[48px] border border-white/5",
          "bg-zinc-900/40 backdrop-blur-3xl shadow-2xl relative flex flex-col text-center"
        )}
      >
        <ConnectionIllustration />

        <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-8">
          Connection Lost
        </h2>

        <p className="text-zinc-400 text-[15px] leading-relaxed mb-10 px-2 font-medium">
          We're having trouble reaching the network. This page will update once your internet connection is restored. Please try again later.
        </p>

        <div className="space-y-6">
          <RetryButton onClick={handleRetry} loading={isRetrying} />
          <p className="text-[11px] font-bold text-zinc-600 leading-tight uppercase tracking-tight">
            Tap once you are reconnected.
          </p>
        </div>
      </motion.div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full bg-[#0a0a0a] border-t border-white/5 py-4 px-6 flex items-center justify-between z-50">
        <NavItem icon={<Home />} label="Home" />
        <NavItem icon={<Calendar />} label="Sessions" />
        <NavItem icon={<MessageSquare />} label="Messages" />
        <NavItem icon={<LogOut />} label="Log Out" />
      </nav>
    </div>
  );
};

// Internal Navigation Helper
const NavItem = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
  <button className="flex flex-col items-center gap-1.5 transition-all opacity-60 hover:opacity-100 text-zinc-500">
    {React.cloneElement(icon as React.ReactElement<any>, { size: 24, strokeWidth: 1.5 })}
    <span className="text-[10px] font-bold tracking-tight">{label}</span>
  </button>
);

export default ConnectionLost;