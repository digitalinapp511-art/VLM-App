import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Home,
  BookOpen,
  Wallet,
  Library,
  User,
  Star
} from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import TicketFormField from "@/components/basic/teacher/TicketFormField";
import FileUploadSection from "@/components/basic/teacher/FileUploadSection";

const CreateSupportTicket: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={cn("min-h-screen flex flex-col p-4 pb-28 relative overflow-x-hidden", bgCss)}>

      {/* Decorative BG Assets */}
      <div className="absolute top-40 -left-4 text-blue-500/20 blur-[1px] rotate-45">
        <Star size={16} fill="currentColor" />
      </div>

      {/* App Bar Header */}
      <header className="flex items-center justify-between py-4 mb-4 max-w-xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-white hover:opacity-70 transition-opacity">
            <ChevronLeft size={28} />
          </button>
          <div className="space-y-0.5">
            <h1 className="text-xl font-black text-white tracking-tight uppercase">Teacher Portal</h1>
            <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest leading-none">
              Dr. Elena Petrova | Faculty
            </p>
          </div>
        </div>
        <Avatar className="w-11 h-11 border-2 border-white/10 shadow-xl">
          <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Elena" />
          <AvatarFallback>EP</AvatarFallback>
        </Avatar>
      </header>

      <div className="w-full max-w-xl mx-auto space-y-6">
        <h2 className="text-[13px] font-black text-white uppercase tracking-[0.2em] ml-2 mb-2">
          CREATE SUPPORT TICKET
        </h2>

        {/* Form Inputs */}
        <TicketFormField
          label="Select Issue Category"
          type="select"
          placeholder="Select Category (e.g., Wallet Issue)"
          icon={<DollarSign size={20} />}
          helperText="Helps route to the right team"
        />

        <TicketFormField
          label="Subject"
          placeholder="Enter a brief summary of your problem"
          helperText="Briefly describe the issue"
          charCount="0 / 0"
        />

        <TicketFormField
          label="Detailed Description"
          type="textarea"
          placeholder="Type your detailed description here..."
          helperText="Provide session IDs, dates, etc."
          charCount="0 / 500"
        />

        {/* Attachment Section */}
        <FileUploadSection />

        {/* Submit Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-4"
        >
          <Button className={cn(
            "w-full h-20 rounded-[2.5rem] text-lg font-black uppercase tracking-widest gap-3 transition-all",
            "bg-gradient-to-r from-[#2b4b9b] via-[#1a2e5d] to-[#2b4b9b] bg-[length:200%_auto] hover:bg-right",
            "border border-blue-400/30 shadow-[0_10px_40px_rgba(30,58,138,0.3)] text-white"
          )}>
            Submit Support Ticket
            <ChevronRight size={22} className="opacity-60" />
          </Button>
        </motion.div>
      </div>

      {/* Fixed Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full bg-[#0a0a0a]/95 border-t border-white/5 backdrop-blur-lg px-6 py-4 flex items-center justify-between z-50">
        <NavItem icon={<Home />} label="Home" />
        <NavItem icon={<BookOpen />} label="Classes" />
        <NavItem icon={<Wallet />} label="Wallet" />
        <NavItem icon={<Library />} label="Library" />
        <NavItem icon={<User />} label="Profile" active />
      </nav>
    </div>
  );
};

// Internal Navigation Helper Component
const NavItem = ({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) => (
  <button className={cn(
    "flex flex-col items-center gap-1.5 transition-all duration-300",
    active ? "text-cyan-400" : "text-zinc-600 hover:text-zinc-400"
  )}>
    <div className={cn("relative transition-transform duration-300", active && "scale-110 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]")}>
      {React.cloneElement(icon as React.ReactElement<any>, ({ size: 24, strokeWidth: active ? 2.5 : 1.5 } as any))}
    </div>
    <span className="text-[10px] font-bold uppercase tracking-widest leading-none">{label}</span>
  </button>
);

export default CreateSupportTicket;