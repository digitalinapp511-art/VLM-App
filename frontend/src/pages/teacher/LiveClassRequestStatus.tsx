import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  ChevronLeft, FileText, Star, Home, BookOpen, Wallet, Library, User, PlusCircle 
} from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { PATHS } from "@/routes/paths";
import { useQuery } from "@tanstack/react-query";
import { teacherApi } from "@/lib/teacher-api";
import StatusTimelineCard from "@/components/basic/teacher/StatusTimelineCard";

const ClassCountdown: React.FC<{ scheduledAt: string; onReady: () => void }> = ({ scheduledAt, onReady }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(scheduledAt) - +new Date();
      if (difference <= 0) {
        setTimeLeft("Class time has arrived!");
        setIsReady(true);
        onReady();
        return;
      }
      
      // If within 15 minutes, enable the button
      if (difference <= 15 * 60 * 1000) {
        setIsReady(true);
        onReady();
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      const parts = [];
      if (hours > 0) parts.push(`${hours.toString().padStart(2, '0')}h`);
      parts.push(`${minutes.toString().padStart(2, '0')}m`);
      parts.push(`${seconds.toString().padStart(2, '0')}s`);

      setTimeLeft(`Starts in: ${parts.join(" ")}`);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [scheduledAt]);

  return (
    <div className={cn(
      "text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full inline-block mt-2",
      isReady 
        ? "bg-green-500/10 text-green-400 border border-green-500/20" 
        : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
    )}>
      {timeLeft}
    </div>
  );
};

const LiveClassRequestStatus: React.FC = () => {
  const navigate = useNavigate();
  const [readyClasses, setReadyClasses] = useState<Record<string, boolean>>({});

  const { data: classes, isLoading } = useQuery({
    queryKey: ["liveClasses"],
    queryFn: teacherApi.getLiveClasses,
  });

  const mapStatusToTimeline = (dbStatus: string): "approved" | "action" | "review" | "rejected" => {
    switch (dbStatus) {
      case "approved":
      case "live":
      case "ended":
        return "approved";
      case "needs_changes":
        return "action";
      case "pending":
      case "draft":
        return "review";
      case "rejected":
      case "cancelled":
      default:
        return "rejected";
    }
  };

  const getButtonText = (dbStatus: string, isReady: boolean): string => {
    switch (dbStatus) {
      case "approved":
      case "live":
        return isReady ? "Go Live Now" : "Waiting for Time";
      case "ended":
        return "Completed";
      case "needs_changes":
        return "Edit Request";
      case "pending":
      case "draft":
        return "Withdraw Request";
      case "rejected":
      case "cancelled":
      default:
        return "Reapply";
    }
  };

  const handleCardAction = (item: any) => {
    const status = item.status;
    if (status === "ended") {
      alert("This class has already ended.");
      return;
    }
    if (status === "approved" || status === "live") {
      navigate(PATHS.TEACHER_LIVE_SESSION, { state: { classId: item._id, topic: item.topic } });
    } else {
      alert(`Class status is "${status}". Action not available yet.`);
    }
  };

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
          My Live Classes
        </motion.h2>

        {/* Timeline Container */}
        <div className="flex flex-col">
          {isLoading ? (
            <div className="text-center py-12 text-zinc-500 font-bold uppercase tracking-wider text-xs">
              Loading requests...
            </div>
          ) : !classes || classes.length === 0 ? (
            <div className="text-center py-12 px-6 rounded-3xl border border-dashed border-white/10 bg-white/[0.01]">
              <p className="text-zinc-500 font-bold uppercase tracking-wider text-xs mb-4">No live classes scheduled</p>
              <button 
                onClick={() => navigate(PATHS.CREATE_LIVE_CLASS)}
                className="px-6 py-3 rounded-full bg-cyan-400 text-black font-black uppercase text-xs tracking-widest hover:bg-cyan-300 transition-all"
              >
                Create a Class Now
              </button>
            </div>
          ) : (
            classes.map((item: any) => {
              const isApproved = item.status === "approved" || item.status === "live";
              const isReady = item.status !== "ended" && (!isApproved || !!readyClasses[item._id]);

              return (
                <StatusTimelineCard
                  key={item._id}
                  status={mapStatusToTimeline(item.status)}
                  topic={item.topic}
                  date={item.scheduledAt ? new Date(item.scheduledAt).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : "N/A"}
                  notes={item.rejectionReason}
                  buttonText={getButtonText(item.status, isReady)}
                  onClick={() => handleCardAction(item)}
                  disabled={!isReady}
                >
                  <div className="bg-zinc-900/60 rounded-2xl p-4 mb-4 space-y-2 border border-white/5">
                    <div className="text-[11px] font-medium text-zinc-400 space-y-1.5 text-left">
                      <p><span className="text-zinc-500 font-bold uppercase mr-1">Subject:</span> {item.subject || "N/A"}</p>
                      <p><span className="text-zinc-500 font-bold uppercase mr-1">Class:</span> {item.class || "N/A"}</p>
                      <p><span className="text-zinc-500 font-bold uppercase mr-1">Board:</span> {item.board || "N/A"}</p>
                      <p><span className="text-zinc-500 font-bold uppercase mr-1">Language:</span> {item.language || "N/A"}</p>
                      {item.description && (
                        <div className="pt-1">
                          <span className="text-zinc-500 font-bold uppercase block mb-0.5">Description:</span>
                          <p className="line-clamp-2">{item.description}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {isApproved && (
                    <div className="rounded-2xl border border-dashed border-cyan-500/40 bg-cyan-500/[0.03] p-4 text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="text-cyan-400" size={16} />
                        <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">
                          Schedule Status
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed mb-2">
                        This session is approved. You can start the class once the scheduled time is reached.
                      </p>
                      <ClassCountdown 
                        scheduledAt={item.scheduledAt} 
                        onReady={() => setReadyClasses(prev => ({ ...prev, [item._id]: true }))}
                      />
                    </div>
                  )}
                </StatusTimelineCard>
              );
            })
          )}
        </div>

        {/* Footer Info */}
        <footer className="mt-8 text-center pb-10">
          <div className="inline-block px-6 py-4 rounded-3xl bg-zinc-950/40 backdrop-blur-sm border border-white/5">
            <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest leading-loose">
              Classes are auto-approved on creation.
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