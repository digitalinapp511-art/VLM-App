import React from "react";
import { motion } from "framer-motion";
// import { useNavigate } from "react-router-dom";
import { 
  Paperclip, 
  Image as ImageIcon, 
  FileText, 
  Camera, 
  ChevronRight,
  Home, 
  LayoutGrid, 
  Wallet, 
  Library, 
  UserCircle 
} from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import TicketStatusCard from "@/components/basic/teacher/TicketStatus";
import ThreadMessage from "@/components/basic/teacher/ThreadMsg";

const TicketDetail: React.FC = () => {
  // const navigate = useNavigate();

  return (
    <div className={cn("min-h-screen flex flex-col items-center bg-black p-4 pb-32 relative overflow-x-hidden", bgCss)}>
      
      {/* Header Container - Laptop Optimized */}
      <header className="flex items-center justify-between py-6 max-w-xl mx-auto w-full">
        <div className="space-y-0.5">
          <h1 className="text-xl font-black text-white tracking-tight uppercase leading-none">VLM Academy</h1>
          <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Ticket Detail</p>
        </div>
        <div className="text-right">
          <div className="w-10 h-10 rounded-full border-2 border-cyan-400 p-0.5 ml-auto shadow-[0_0_10px_rgba(34,211,238,0.3)]">
            <div className="w-full h-full rounded-full bg-zinc-800" />
          </div>
          <p className="text-[10px] font-bold text-zinc-500 mt-1 uppercase tracking-tight">
            Dr. Elena Petrova | Faculty
          </p>
        </div>
      </header>

      <div className="w-full max-w-xl mx-auto space-y-8">
        <TicketStatusCard 
          id="VLM-TK-2934" 
          category="Wallet Issue" 
          date="Oct 20, 2024" 
        />

        <div className="space-y-6">
          <h2 className="text-lg font-black text-white ml-2 tracking-tight">Thread: Wallet Issue</h2>
          
          <div className="flex flex-col">
            <ThreadMessage 
              senderType="TEACHER"
              attachments={[{ name: "PHYS-C-101_points.png" }, { name: "rate_PH..." }]}
            >
              <div className="space-y-2">
                <p><span className="font-bold text-white">Problem summary:</span> Wallet shows less points than earned.</p>
                <p><span className="font-bold text-white">Detail:</span> Points not updated for session PHYS-C-101. See attachments.</p>
              </div>
            </ThreadMessage>

            <ThreadMessage senderType="SUPPORT">
              <p>
                Hello Dr. Petrova. Thank you for your ticket. A support specialist is reviewing your session 
                records and wallet history. We should have an update within 24 hours. 
                <br /><br />
                PHYS-C-101 is being double-checked.
              </p>
            </ThreadMessage>

            {/* Next Message Preview */}
            <ThreadMessage senderType="TEACHER">
              <p className="text-zinc-500 italic">Add a follow-up reply...</p>
            </ThreadMessage>
          </div>
        </div>
      </div>

      {/* Floating Action Section */}
      <div className="fixed bottom-0 left-0 w-full p-8 flex flex-col gap-6 bg-gradient-to-t from-black via-black/90 to-transparent pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl mx-auto pointer-events-auto"
        >
          <div className="flex items-center justify-between mb-4 px-2">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Follow-up Attachments</span>
            <div className="flex items-center gap-4">
               <Paperclip size={20} className="text-zinc-600 -rotate-45" />
               <Button size="sm" className="rounded-xl bg-zinc-900/80 border border-white/10 h-10 px-4 gap-2 text-[10px] font-black uppercase text-zinc-400">
                  <Camera size={14} /> Add Files
               </Button>
               <ImageIcon size={20} className="text-zinc-600" />
               <FileText size={20} className="text-zinc-600" />
            </div>
          </div>

          <Button className={cn(
            "w-full h-16 rounded-full text-lg font-black uppercase tracking-widest gap-2 transition-all",
            "bg-gradient-to-r from-[#2b4b9b] to-[#1a2e5d] hover:brightness-110",
            "border border-blue-400/20 shadow-[0_0_30px_rgba(59,130,246,0.4)] text-white"
          )}>
            **Add Follow-up Reply <ChevronRight size={20} className="opacity-50" /> **
          </Button>
        </motion.div>
      </div>

      {/* Standard Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full bg-[#050505]/95 backdrop-blur-xl border-t border-white/5 py-4 px-8 flex justify-center z-50">
        <div className="w-full max-w-xl flex items-center justify-between">
          <NavItem icon={<Home />} label="Home" />
          <NavItem icon={<LayoutGrid />} label="Classes" />
          <NavItem icon={<Wallet />} label="Wallet" active />
          <NavItem icon={<Library />} label="Library" />
          <NavItem icon={<UserCircle />} label="Profile" />
        </div>
      </nav>
    </div>
  );
};

// Internal Navigation Helper
const NavItem = ({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
  <button className={cn(
    "flex flex-col items-center gap-1.5 transition-all duration-300",
    active ? "text-cyan-400" : "text-zinc-600 hover:text-zinc-400"
  )}>
    <div className={cn("relative transition-transform duration-300", active && "scale-110 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]")}>
      {React.cloneElement(icon, { size: 24, strokeWidth: active ? 2.5 : 1.5 })}
    </div>
    <span className="text-[10px] font-bold uppercase tracking-tight leading-none mt-0.5">{label}</span>
  </button>
);

export default TicketDetail;