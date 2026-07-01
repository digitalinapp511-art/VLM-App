import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  ChevronLeft, FileText, Star, Home, BookOpen, Wallet, Library, User, PlusCircle 
} from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { PATHS } from "@/routes/paths";
import StatusTimelineCard from "@/components/basic/teacher/StatusTimelineCard";

const LiveClassRequestStatus: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={cn("min-h-screen flex flex-col p-4 pb-28 relative overflow-x-hidden", bgCss)}>
      {/* Decorative BG Elements */}
      <div className="absolute top-20 -left-2 text-blue-400/20 blur-[1px]">
        <Star size={16} fill="currentColor" />
      </div>
      <div className="absolute top-1/2 -right-4 text-purple-500/20 blur-[1px]">
        <Star size={24} fill="currentColor" />
      </div>

      {/* Header */}
      <header className="w-full max-w-xl mx-auto flex items-center justify-between py-4 mb-4 relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-white"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-sm font-black text-white uppercase tracking-widest px-4">
          Live Classes
        </h1>
        <button
          onClick={() => navigate(PATHS.CREATE_LIVE_CLASS)}
          className="px-4 py-2 text-xs font-black text-cyan-400 bg-cyan-400/10 hover:bg-cyan-400/20 border border-cyan-400/30 rounded-full transition-all flex items-center gap-1.5"
        >
          <PlusCircle size={14} />
          Create Class
        </button>
      </header>

      <div className="w-full max-w-xl mx-auto flex flex-col">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-black text-white text-center mb-8"
        >
          My Class Approval Status
        </motion.h2>

        {/* Timeline Container */}
        <div className="flex flex-col">
          {/* 1. Approved Case */}
          <StatusTimelineCard
            status="approved"
            topic="Advanced Trigonometry"
            date="Oct 26, 11:00 AM"
            buttonText="Go Live Now"
          >
            <div className="bg-zinc-900/60 rounded-2xl p-4 mb-4 space-y-2 border border-white/5">
              <div className="text-[11px] font-medium text-zinc-400 space-y-1.5">
                <p><span className="text-zinc-500 font-bold uppercase mr-1">Topic:</span> Advanced Trigonometry</p>
                <p><span className="text-zinc-500 font-bold uppercase mr-1">Subject:</span> Mathematics</p>
                <p><span className="text-zinc-500 font-bold uppercase mr-1">Class:</span> Grade 10</p>
                <p><span className="text-zinc-500 font-bold uppercase mr-1">Board:</span> CBSE</p>
                <p><span className="text-zinc-500 font-bold uppercase mr-1">Language:</span> English</p>
                <div className="pt-1">
                  <span className="text-zinc-500 font-bold uppercase block mb-0.5">Description:</span>
                  <p className="line-clamp-2">Mastering complex functions and ensuring deep conceptual clarity...</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-yellow-500/40 bg-yellow-500/[0.03] p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="text-yellow-500" size={16} />
                <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">
                  Moderator Feedback
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Approved for publication. Excellent session plan. Remember to upload pre-session reading materials by Oct 24th.
              </p>
            </div>
          </StatusTimelineCard>

          {/* 2. Action Required Case */}
          <StatusTimelineCard
            status="action"
            topic="Fractions Basics"
            notes="Please clarify objectives"
            buttonText="Edit Request"
          />

          {/* 3. Under Review Case */}
          <StatusTimelineCard
            status="review"
            topic="Biology: Cell Structure"
            notes="Under Review"
            buttonText="Withdraw Request"
          />

          {/* 4. Rejected Case */}
          <StatusTimelineCard
            status="rejected"
            topic="Global History"
            notes="Topic already covered"
            buttonText="Reapply"
          />
        </div>

        {/* Footer Info */}
        <footer className="mt-8 text-center pb-10">
          <div className="inline-block px-6 py-4 rounded-3xl bg-zinc-950/40 backdrop-blur-sm border border-white/5">
            <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest leading-loose">
              Teacher: Dr. Elena Petrova | ID: VLM-FA-01234<br />
              Note: Session approval takes up to 24 hours.
            </p>
          </div>
        </footer>
      </div>

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

export default LiveClassRequestStatus;