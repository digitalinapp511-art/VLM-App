import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Home, BookOpen, Wallet, Library, User, XCircle, Star } from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { teacherApi } from "@/lib/teacher-api";
import { PATHS } from "@/routes/paths";

const MissedRequestsPage: React.FC = () => {
  const navigate = useNavigate();

  const { data: missedSessions = [], isLoading } = useQuery({
    queryKey: ["missedSessions"],
    queryFn: async () => {
      const data = await teacherApi.getSessions({ status: "missed" });
      return data || [];
    },
  });

  const formatTimestamp = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className={cn("min-h-screen flex flex-col p-4 pb-28 relative overflow-x-hidden", bgCss)}>
      {/* Decorative Assets */}
      <div className="absolute top-20 -left-2 text-red-500/20 blur-[1px] rotate-45">
        <Star size={16} fill="currentColor" />
      </div>

      {/* Header */}
      <header className="flex items-center justify-between py-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-white hover:opacity-70 transition-opacity"
        >
          <ChevronLeft size={28} />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-500 shadow-inner">
            <XCircle size={18} className="text-red-500" />
          </div>
          <h1 className="text-base font-black text-white tracking-tight">Missed Requests</h1>
        </div>

        <Avatar className="w-10 h-10 border-2 border-white/10">
          <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher" />
          <AvatarFallback>TH</AvatarFallback>
        </Avatar>
      </header>

      <div className="w-full max-w-xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-[40px] border-2 border-red-500/20 bg-zinc-950/40 backdrop-blur-2xl shadow-[0_0_40px_rgba(239,68,68,0.05)]"
        >
          <h3 className="text-[13px] font-black text-red-400 uppercase tracking-[0.2em] mb-6">
            Missed Doubts
          </h3>

          <div className="flex flex-col gap-4">
            {isLoading ? (
              <p className="text-xs text-zinc-500 py-4 text-center">Loading missed requests...</p>
            ) : missedSessions.length === 0 ? (
              <p className="text-xs text-zinc-500 py-4 text-center">No missed requests found</p>
            ) : (
              missedSessions.map((session: any) => {
                const studentName = session.studentId?.fullName || session.studentId?.nickname || "Student";
                const className = session.studentId?.class ? `Class ${session.studentId.class}` : "Grade N/A";
                const subjectName = session.subject || "General";

                return (
                  <div key={session._id || session.id} className="flex items-center gap-4 py-4 border-b border-white/5 last:border-0">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center border bg-rose-500/10 border-rose-500/20 text-rose-500">
                      <XCircle size={20} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-[15px] font-bold text-zinc-100 truncate">{studentName}</h4>
                      <p className="text-[11px] font-medium text-zinc-500 truncate leading-relaxed">
                        {className} • Subject: {subjectName}
                      </p>
                      <p className="text-[11px] font-medium text-zinc-600">
                        {formatTimestamp(session.createdAt)}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                        Missed
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>

      {/* Bottom Navigation Tab Bar */}
      <nav className="fixed bottom-0 left-0 w-full bg-[#0a0a0a]/95 border-t border-white/5 backdrop-blur-lg px-6 py-4 flex items-center justify-between z-50">
        <NavItem icon={<Home />} label="Home" onClick={() => navigate(PATHS.TEACHER_DASHBOARD)} />
        <NavItem icon={<BookOpen />} label="Classes" onClick={() => navigate(PATHS.TEACHER_CLASSES)} />
        <NavItem icon={<Wallet />} label="Wallet" onClick={() => navigate(PATHS.TEACHER_WALLET)} />
        <NavItem icon={<Library />} label="Library" onClick={() => navigate(PATHS.TEACHER_LIBRARY)} />
        <NavItem icon={<User />} label="Profile" onClick={() => navigate(PATHS.TEACHER_PROFILE)} />
      </nav>
    </div>
  );
};

const NavItem = ({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex flex-col items-center gap-1.5 transition-all duration-300",
      active ? "text-cyan-400" : "text-zinc-600 hover:text-zinc-400"
    )}
  >
    <div className={cn("relative", active && "drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]")}>
      {React.cloneElement(icon as React.ReactElement<any>, ({ size: 24, strokeWidth: active ? 2.5 : 1.5 } as any))}
    </div>
    <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    {active && <motion.div layoutId="navDot" className="w-1 h-1 rounded-full bg-cyan-400" />}
  </button>
);

export default MissedRequestsPage;
