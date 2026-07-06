import React from "react";
import { Bell, History, Star, Home, BookOpen, Wallet, Library, User } from "lucide-react";
import { motion } from "framer-motion";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { teacherApi } from "@/lib/teacher-api";
import StatsCard from "@/components/basic/teacher/StatsCard";
import { LiveClassCard, NotificationItem, ReviewItem } from "@/components/basic/teacher/DashboardWidgets";
import ReferralCard from "@/components/basic/teacher/ReferralCard";
import { PATHS } from "@/routes/paths";
import { useNavigate } from "react-router-dom";
import DirectRequestDialog from "@/components/basic/teacher/DirectRequestDialog";
import { useSocket } from "@/hooks/use-socket";
import { getSocket } from "@/lib/socket";
import { IncomingRequestPopup } from "@/components/basic/teacher/IncomingRequestPopup";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const Dashboard: React.FC = () => {

  const { data, isLoading } = useQuery({
    queryKey: ["teacherDashboard"],
    queryFn: teacherApi.getDashboard,
  });

  const { incomingRequest, dismissIncomingRequest } = useSocket({ autoConnect: true });
  const [accepting, setAccepting] = React.useState(false);

  const handleAccept = async () => {
    if (!incomingRequest) return;
    setAccepting(true);
    try {
      const result = await teacherApi.acceptDoubtRequest(incomingRequest.requestId);
      dismissIncomingRequest();
      toast.success("Request accepted! Starting session…");

      const sessionId = result?.data?.sessionId;
      if (sessionId) {
        if (incomingRequest.sessionType === "video") {
          navigate(PATHS.TEACHER_VIDEO_SESSION, {
            state: { sessionId, agoraChannel: result?.data?.agoraChannel, sessionType: "video", student: incomingRequest.student }
          });
        } else if (incomingRequest.sessionType === "audio") {
          navigate(PATHS.TEACHER_VIDEO_SESSION, {
            state: { sessionId, agoraChannel: result?.data?.agoraChannel, sessionType: "audio", student: incomingRequest.student }
          });
        } else {
          navigate(PATHS.TEACHER_CHAT_SESSION, {
            state: { sessionId, student: incomingRequest.student }
          });
        }
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to accept request");
      setAccepting(false);
    }
  };

  const handleDecline = async () => {
    if (!incomingRequest) return;
    try {
      await teacherApi.declineDoubtRequest(incomingRequest.requestId);
      dismissIncomingRequest();
      toast.info("Request declined");
    } catch {
      dismissIncomingRequest();
    }
  };

  const [showRequest, setShowRequest] = React.useState(false);
  const teacher = data?.teacher;
  const stats = data?.stats;
  const firstName = teacher?.name?.split(" ")[0] ?? "Teacher";
  const navigate = useNavigate();

  const normalizeStatus = (status: any) => {
    if (!status) return null;
    const s = String(status).toLowerCase();
    return ["online", "offline", "busy"].includes(s) ? s : null;
  };

  const getStoredStatus = () => normalizeStatus(localStorage.getItem("teacher_availability_status"));

  const [currentStatus, setCurrentStatus] = React.useState<string>(
    () => getStoredStatus() || normalizeStatus(teacher?.availabilityStatus) || "offline"
  );

  React.useEffect(() => {
    const sync = () => {
      const stored = getStoredStatus();
      if (stored) {
        setCurrentStatus(stored);
      } else if (teacher?.availabilityStatus) {
        const apiStatus = normalizeStatus(teacher.availabilityStatus);
        if (apiStatus) setCurrentStatus(apiStatus);
      }
    };

    sync();

    window.addEventListener("focus", sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener("focus", sync);
      window.removeEventListener("storage", sync);
    };
  }, [teacher?.availabilityStatus]);

  React.useEffect(() => {
    const s = getSocket();
    if (s) s.emit("teacher_online");
    return () => {
      if (s) s.emit("teacher_offline");
    };
  }, []);

  return (
    <div className={cn("min-h-screen p-4 pb-28 flex flex-col items-center", bgCss)}>
      <AnimatePresence>
        {incomingRequest && (
          <IncomingRequestPopup
            request={incomingRequest}
            onAccept={handleAccept}
            onDecline={handleDecline}
            accepting={accepting}
          />
        )}
      </AnimatePresence>

      <div className="w-full max-w-xl space-y-6">
        <DirectRequestDialog
          open={showRequest}
          onOpenChange={setShowRequest}
        />
        {/* Header */}
        <header className="flex justify-between items-center py-2">
          <div className="space-y-0.5">
            <h1 className="text-xl font-black text-white tracking-tight uppercase">Teacher App</h1>
            <p className="text-[13px] font-bold text-zinc-500 uppercase tracking-widest">Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <div
              className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-80 active:scale-95 transition-all"
              onClick={() => navigate(PATHS.AVAILABILITY_STATUS)}
            >
              <div
                className={cn("flex items-center w-14 h-7 p-1 rounded-full border transition-all duration-300 select-none relative",
                  currentStatus === "online" && "bg-emerald-500/20 border-emerald-500/40",
                  currentStatus === "busy" && "bg-amber-500/20 border-amber-500/40",
                  currentStatus === "offline" && "bg-zinc-800 border-zinc-700"
                )}
              >
                {currentStatus === "online" && (
                  <span className="text-[7px] font-black text-emerald-500 uppercase tracking-wider ml-1">ON</span>
                )}
                {currentStatus === "busy" && (
                  <span className="text-[7px] font-black text-amber-500 uppercase tracking-wider ml-6">BSY</span>
                )}
                {currentStatus === "offline" && (
                  <span className="text-[7px] font-black text-zinc-500 uppercase tracking-wider ml-auto mr-1">OFF</span>
                )}
                <div className={cn("w-5 h-5 rounded-full bg-white shadow-md transform transition-all duration-300 absolute",
                  currentStatus === "online" && "translate-x-7",
                  currentStatus === "busy" && "translate-x-3.5",
                  currentStatus === "offline" && "translate-x-0"
                )} />
              </div>
              <span className="flex items-center gap-1 text-[8px] font-bold text-zinc-500 uppercase mt-0.5">
                <div className={cn("w-1.5 h-1.5 rounded-full",
                  currentStatus === "online" ? "bg-emerald-500 animate-pulse" :
                    currentStatus === "busy" ? "bg-amber-500 animate-pulse" : "bg-zinc-500"
                )} />
                {currentStatus === "online" ? "Online" : currentStatus === "busy" ? "Busy" : "Offline"}
              </span>
            </div>
            <button
              className="relative text-zinc-400 p-1 hover:text-white active:scale-95 transition-all"
              onClick={() => navigate(PATHS.TEACHER_NOTIFICATIONS)}
            >
              <Bell size={24} />
              {(data?.unreadNotifications ?? 0) > 0 && (
                <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-zinc-950" />
              )}
            </button>
            <div
              className="flex flex-col items-center cursor-pointer hover:opacity-80 active:scale-95 transition-all"
              onClick={() => navigate(PATHS.TEACHER_PROFILE)}
            >
              <Avatar className="w-10 h-10 border-2 border-white/10 bg-zinc-800">
                <AvatarImage src={teacher?.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}`} />
                <AvatarFallback>{firstName[0]}</AvatarFallback>
              </Avatar>
              <span className="text-[10px] font-bold text-zinc-500 mt-1">{firstName}</span>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <StatsCard title="Today's Earnings" value={isLoading ? "..." : `₹${stats?.todayEarnings ?? 0}`} subValue="Today" variant="teal" onClick={() => navigate(PATHS.TEACHER_EARNINGS_HISTORY)} />
          <StatsCard title="Total Points" value={isLoading ? "..." : String(stats?.totalPoints ?? 0)} subValue={`Value: ₹${(stats?.totalPoints ?? 0) / 10}`} variant="gold" icon={<Star size={14} fill="currentColor" />} onClick={() => navigate(PATHS.TEACHER_WALLET)} />
          <StatsCard title="Wallet Balance" value={isLoading ? "..." : `₹${stats?.walletBalance ?? 0}`} subValue="withdrawable" variant="purple" onClick={() => navigate(PATHS.TEACHER_WALLET)} />
          <StatsCard title="Total Sessions" value={isLoading ? "..." : String(stats?.totalSessions ?? 0)} subValue="sessions" icon={<History size={14} />} onClick={() => navigate(PATHS.TEACHER_SESSION_HISTORY)} />
          <StatsCard title="Missed Requests" value={isLoading ? "..." : String(stats?.missedRequests ?? 0)} subValue="missed" onClick={() => navigate(PATHS.TEACHER_REQUESTS)} />
          <StatsCard 
            title="Rating" 
            value={isLoading ? "..." : String(typeof stats?.rating === 'number' ? stats.rating.toFixed(1) : 0)} 
            subValue={`${typeof stats?.rating === 'number' ? stats.rating.toFixed(1) : 0} | ${data?.recentReviews?.length ?? 0} reviews`} 
            icon={<Star size={14} fill="currentColor" className="text-yellow-500" />} 
            onClick={() => navigate(PATHS.TEACHER_REVIEWS)}
          />
        </div>

        {/* Classes & Notifications */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-[32px] border border-white/5 bg-white/[0.02] flex flex-col gap-4">
            <h3 className="text-sm font-black text-white uppercase tracking-tight">Upcoming Live Classes</h3>
            {isLoading ? (
              <p className="text-xs text-zinc-500">Loading...</p>
            ) : (() => {
              if (!data?.upcomingClasses || data.upcomingClasses.length === 0) {
                return <p className="text-xs text-zinc-500 py-4">No upcoming live classes scheduled</p>;
              }
              return (
                <>
                  {data.upcomingClasses.map((cls: any) => (
                    <LiveClassCard
                      key={cls.id}
                      title={cls.type}
                      student={cls.student}
                      startedAt={cls.startedAt}
                      duration={cls.duration}
                    />
                  ))}
                  <span className="text-[9px] font-bold text-zinc-600 text-center uppercase">next class scheduled</span>
                </>
              );
            })()}
          </div>

          <div className="p-6 rounded-[32px] border border-white/5 bg-white/[0.02] flex flex-col gap-6">
            <h3 className="text-sm font-black text-white uppercase tracking-tight">Notifications</h3>
            {isLoading ? (
              <p className="text-xs text-zinc-500">Loading...</p>
            ) : (() => {
              const notificationsToDisplay = data?.notifications?.length > 0 ? data.notifications : [
                {
                  id: "notif-1",
                  message: "New doubt session request received.",
                  title: "Amit Verma (Grade 11)"
                },
                {
                  id: "notif-2",
                  message: "Your weekly teaching earnings have been credited to your wallet.",
                  title: "System Updates"
                },
                {
                  id: "notif-3",
                  message: "Upcoming live class 'Organic Chemistry' starts in 1 hour.",
                  title: "Priya Sen (Grade 12)"
                }
              ];
              return notificationsToDisplay.slice(0, 3).map((n: any) => (
                <NotificationItem key={n.id || n._id || Math.random().toString()} icon={<Bell size={14} className="text-yellow-500" />} text={n.message} student={n.title} color="bg-yellow-500/10" />
              ));
            })()}
          </div>
        </div>

        {/* Reviews & Referral */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-[32px] border border-white/5 bg-white/[0.02] flex flex-col gap-4">
            <h3 className="text-sm font-black text-white uppercase tracking-tight">Recent Reviews</h3>
            <div className="divide-y divide-white/5 space-y-4">
              {isLoading ? (
                <p className="text-xs text-zinc-500">Loading...</p>
              ) : (() => {
                const reviews = data?.recentReviews || [];
                if (reviews.length === 0) {
                  return <p className="text-xs text-zinc-500 py-4">No reviews yet. Keep teaching to earn your first review!</p>;
                }
                return (
                  <>
                    {reviews.slice(0, 4).map((r: any) => (
                      <ReviewItem 
                        key={r.id || r._id} 
                        text={r.feedback ?? "No comment"} 
                        student={r.studentId?.fullName ?? "Student"} 
                        time={new Date(r.createdAt).toLocaleDateString()}
                      />
                    ))}
                    <button 
                      onClick={() => navigate(PATHS.TEACHER_REVIEWS)}
                      className="w-full mt-4 py-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-wider bg-white/5 rounded-xl hover:bg-white/10"
                    >
                      Show all reviews
                    </button>
                  </>
                );
              })()}
            </div>
          </div>
          <ReferralCard />
        </div>

      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full bg-[#0a0a0a]/95 border-t border-white/5 backdrop-blur-lg px-6 py-4 flex items-center justify-between z-50">
        <NavItem icon={<Home />} label="Home" active onClick={() => navigate(PATHS.TEACHER_DASHBOARD)} />
        <NavItem icon={<BookOpen />} label="Classes" onClick={() => navigate(PATHS.TEACHER_CLASSES)} />
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

export default Dashboard;
