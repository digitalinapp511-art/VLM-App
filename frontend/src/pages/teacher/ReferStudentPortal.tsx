import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home, BookOpen, Wallet, Library, User } from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import ReferralPromoCard from "@/components/basic/teacher/ReferralPromoCard";
import { LinkShareInput, ReferralCodeBox } from "@/components/basic/teacher/ReferralActions";
import QrScanArea from "@/components/basic/teacher/QrScanArea";

const ReferStudentPortal: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={cn("min-h-screen flex flex-col p-4 pb-28 relative overflow-x-hidden", bgCss)}>

      {/* Header */}
      <header className="flex items-center justify-between py-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-white hover:opacity-70 transition-opacity"
          >
            <ArrowLeft size={28} />
          </button>
          <h1 className="text-xl font-black text-white tracking-tight uppercase">
            Refer Student Portal
          </h1>
        </div>
        <Avatar className="w-11 h-11 border-2 border-white/10">
          <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher" />
          <AvatarFallback>TH</AvatarFallback>
        </Avatar>
      </header>

      <div className="w-full max-w-xl mx-auto space-y-10">
        <ReferralPromoCard />

        <div className="space-y-12">
          <LinkShareInput link="vlm.academy/sr/54321/teacher1" />
          <ReferralCodeBox code="TEACHER1-54321" />
          <QrScanArea />
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full bg-[#0a0a0a]/95 border-t border-white/5 backdrop-blur-lg px-6 py-4 flex items-center justify-between z-50">
        <NavItem icon={<Home />} label="Home" />
        <NavItem icon={<BookOpen />} label="Classes" />
        <NavItem icon={<Wallet />} label="Wallet" active />
        <NavItem icon={<Library />} label="Library" />
        <NavItem icon={<User />} label="Profile" />
      </nav>
    </div>
  );
};

// Internal Nav Item Helper
const NavItem = ({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) => (
  <button className={cn(
    "flex flex-col items-center gap-1.5 transition-all duration-300",
    active ? "text-cyan-400" : "text-zinc-600 hover:text-zinc-400"
  )}>
    <div className={cn("relative", active && "drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]")}>
      {React.cloneElement(icon as React.ReactElement<any>, ({ size: 24, strokeWidth: active ? 2.5 : 1.5 } as any))}
    </div>
    <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    {active && <motion.div layoutId="navDot" className="w-1 h-1 rounded-full bg-cyan-400" />}
  </button>
);

export default ReferStudentPortal;