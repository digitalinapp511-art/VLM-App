import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronDown, 
  CheckCircle2, 
  XCircle, 
  Play, 
  Clock, 
  Search, 
  SlidersHorizontal 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { bgCss } from "@/helper/CssHelper";
import { apiClient } from "@/lib/api-client";
import { PATHS } from "@/routes/paths";
import ParentLayout from "@/components/layout/ParentLayout";

export default function LiveActivity() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"tracking" | "recordings">("tracking");
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Fetch parent dashboard to get actual linked child profiles
  const { data: dashboardData, isLoading } = useQuery<any>({
    queryKey: ["parentDashboardLearning"],
    queryFn: async () => {
      const { data } = await apiClient.get("/parent/dashboard");
      return data.data;
    }
  });

  const children = dashboardData?.children || [];
  const activeChildObj = children[selectedChildIndex] || children[0];
  const activeStudent = activeChildObj?.student || {};
  const studentName = activeStudent.fullName || "Student";

  // Enforce redirection to add-child if no children linked yet
  useEffect(() => {
    if (!isLoading && children.length === 0) {
      navigate(PATHS.ADD_CHILD, { replace: true });
    }
  }, [isLoading, children.length, navigate]);

  if (isLoading || children.length === 0) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-zinc-500 font-bold uppercase tracking-wider text-xs">
        Loading...
      </div>
    );
  }

  // Simulated list of Attended & Missed classes matching mockup
  const attendedClasses = [
    {
      id: "1",
      teacher: "Mr. James Davis",
      subject: "Math: Quadratic Equations",
      time: "Oct 28, 10:30 AM",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
      status: "Completed",
      type: "Attended"
    },
    {
      id: "2",
      teacher: "Dr. Evelyn Reed",
      subject: "English: The Great Gatsby",
      time: "Oct 30, 11:00 AM",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Evelyn",
      status: "Completed",
      type: "Attended"
    }
  ];

  const missedClasses = [
    {
      id: "3",
      teacher: "Ms. Isabella Rodriguez",
      subject: "Science: The Periodic Table",
      time: "Oct 29, 3:00 PM",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Isabella",
      status: "Absent",
      type: "Missed"
    },
    {
      id: "4",
      teacher: "Mr. David Chen",
      subject: "History: The Industrial Revolution",
      time: "Nov 1, 9:00 AM",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
      status: "Absent",
      type: "Missed"
    }
  ];

  // Simulated list of recorded sessions matching mockup
  const recordings = [
    {
      id: "rec1",
      title: "Advanced Astrophysics",
      teacher: "Dr. Amelia Thorne",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amelia",
      duration: "1h 15m"
    },
    {
      id: "rec2",
      title: "Quantum Mechanics",
      teacher: "Prof. David Chen",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ProfDavid",
      duration: "1h 45m"
    }
  ];

  return (
    <ParentLayout>
      <div className="space-y-4">
        
        {/* --- HEADER --- */}
        <header className="relative w-full flex items-center justify-between pt-2">
          <div className="w-9" />

          <h2 style={{ fontFamily: 'Cinzel, serif' }} className="text-sm font-extrabold tracking-[0.2em] text-[#D4AF37] uppercase mt-0.5">
            {activeTab === "tracking" ? "LIVE CLASS TRACKING" : "SESSION RECORDINGS"}
          </h2>

          <div className="flex items-center gap-2 text-right">
            <span className="text-[10px] text-zinc-400 font-medium block leading-tight">
              Welcome,<br/>
              <span className="text-white font-bold">Parent</span>
            </span>
            <Avatar className="h-8 w-8 border border-white/10 shrink-0">
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=ParentUser" />
              <AvatarFallback>P</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* --- STUDENT DROPDOWN SELECTOR --- */}
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full p-3.5 rounded-2xl border border-white/5 bg-[#1a1a1a]/40 backdrop-blur-3xl flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Avatar className="h-6 w-6 border border-white/20">
                <AvatarImage src={activeStudent.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${studentName}`} />
                <AvatarFallback>{studentName[0]}</AvatarFallback>
              </Avatar>
              <span className="text-xs font-bold text-white tracking-wide">{studentName}'s Profile</span>
            </div>
            <ChevronDown className={cn("h-4 w-4 text-zinc-400 transition-transform", isDropdownOpen && "rotate-180")} />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute left-0 right-0 mt-1.5 z-40 bg-[#151515] border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-1"
              >
                {children.map((child: any, idx: number) => {
                  const name = child.student?.fullName || "Student";
                  return (
                    <button
                      key={child.student?._id || idx}
                      onClick={() => {
                        setSelectedChildIndex(idx);
                        setIsDropdownOpen(false);
                      }}
                      className={cn(
                        "w-full px-3 py-2.5 rounded-xl text-left text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer",
                        idx === selectedChildIndex ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={child.student?.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} />
                        <AvatarFallback>{name[0]}</AvatarFallback>
                      </Avatar>
                      {name}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* --- TAB SELECTOR --- */}
        <div className="bg-[#161616]/60 border border-white/5 p-1 rounded-2xl flex gap-1 shadow-inner">
          <button 
            onClick={() => setActiveTab("tracking")}
            className={cn(
              "flex-1 py-2 rounded-xl text-[11px] font-bold tracking-wider transition-all cursor-pointer uppercase",
              activeTab === "tracking" ? "bg-gradient-to-r from-blue-600 to-indigo-900 text-white border border-blue-500/40 shadow-lg" : "text-zinc-400 hover:text-white"
            )}
          >
            Live Tracking
          </button>
          <button 
            onClick={() => setActiveTab("recordings")}
            className={cn(
              "flex-1 py-2 rounded-xl text-[11px] font-bold tracking-wider transition-all cursor-pointer uppercase",
              activeTab === "recordings" ? "bg-gradient-to-r from-blue-600 to-indigo-900 text-white border border-blue-500/40 shadow-lg" : "text-zinc-400 hover:text-white"
            )}
          >
            Recordings
          </button>
        </div>

        {/* --- CONTENT TABS --- */}
        <main className="space-y-4">
          {activeTab === "tracking" ? (
            <div className="space-y-5 animate-in fade-in duration-300">
              
              {/* Attended Classes */}
              <div className="space-y-2.5">
                <h3 className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase text-left">
                  ATTENDED CLASSES
                </h3>
                <div className="space-y-3">
                  {attendedClasses.map((item) => (
                    <Card key={item.id} className="border-green-500/10 bg-zinc-900/30 backdrop-blur-md rounded-2xl shadow-sm">
                      <CardContent className="p-3.5 flex items-center justify-between gap-3 text-left">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12 border border-white/10 shrink-0">
                            <AvatarImage src={item.avatar} />
                            <AvatarFallback>{item.teacher[0]}</AvatarFallback>
                          </Avatar>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-extrabold text-white leading-none">{item.teacher}</p>
                              <span className="text-[9px] font-black text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-full leading-none">
                                - {item.type}
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-400 mt-1">{item.subject}</p>
                            <p className="text-[9px] text-zinc-500 font-medium flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" /> {item.time}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-green-400 shrink-0 self-end">
                          <CheckCircle2 className="w-4 h-4 fill-current text-zinc-950" />
                          <span className="text-[10px] font-bold tracking-tight">{item.status}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Missed Classes */}
              <div className="space-y-2.5">
                <h3 className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase text-left">
                  MISSED CLASSES
                </h3>
                <div className="space-y-3">
                  {missedClasses.map((item) => (
                    <Card key={item.id} className="border-orange-500/10 bg-zinc-900/30 backdrop-blur-md rounded-2xl shadow-sm">
                      <CardContent className="p-3.5 flex items-center justify-between gap-3 text-left">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12 border border-white/10 shrink-0">
                            <AvatarImage src={item.avatar} />
                            <AvatarFallback>{item.teacher[0]}</AvatarFallback>
                          </Avatar>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-extrabold text-white leading-none">{item.teacher}</p>
                              <span className="text-[9px] font-black text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded-full leading-none">
                                - {item.type}
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-400 mt-1">{item.subject}</p>
                            <p className="text-[9px] text-zinc-500 font-medium flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" /> {item.time}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-orange-400 shrink-0 self-end">
                          <XCircle className="w-4 h-4 fill-current text-zinc-950" />
                          <span className="text-[10px] font-bold tracking-tight">{item.status}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-300">
              
              {/* Search & Filter Header */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input 
                    type="text" 
                    placeholder="Search recorded sessions..." 
                    className="w-full h-10 pl-10 pr-4 rounded-xl border border-white/5 bg-[#161616]/40 text-xs font-medium text-white placeholder-zinc-500 focus:outline-none focus:border-white/20"
                  />
                </div>
                <Button variant="outline" size="icon" className="w-10 h-10 rounded-xl border-white/5 bg-[#161616]/40 text-zinc-400 hover:text-white cursor-pointer shrink-0">
                  <SlidersHorizontal className="w-4 h-4" />
                </Button>
              </div>

              {/* Recordings List */}
              <div className="space-y-4">
                {recordings.map((item) => (
                  <Card key={item.id} className="border-cyan-500/15 bg-zinc-900/20 backdrop-blur-3xl rounded-3xl overflow-hidden shadow-lg relative">
                    <CardContent className="p-4 space-y-4 text-left">
                      
                      {/* Video Preview Card overlay */}
                      <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-black/60 flex items-center justify-center group cursor-pointer border border-white/5">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        
                        {/* Play button glow container */}
                        <div className="relative z-10 w-12 h-12 rounded-full bg-cyan-500 flex items-center justify-center text-zinc-950 shadow-[0_0_20px_rgba(6,182,212,0.4)] group-hover:scale-105 transition-transform">
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </div>

                        {/* Title overlay */}
                        <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2.5">
                          <Avatar className="h-6 w-6 border border-white/20">
                            <AvatarImage src={item.avatar} />
                            <AvatarFallback>{item.teacher[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-[10px] text-zinc-400 font-medium">Teacher: {item.teacher}</span>
                        </div>
                      </div>

                      {/* Video Info details */}
                      <div className="space-y-1">
                        <h4 className="text-sm font-extrabold text-white tracking-tight">{item.title}</h4>
                        <p className="text-[10px] text-zinc-500 font-medium">Class recording details and summary</p>
                      </div>

                      {/* Divider */}
                      <div className="h-[1px] bg-white/5 w-full" />

                      {/* Card Footer details */}
                      <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase tracking-tight">
                        <span className="text-zinc-500">Teacher: {item.teacher}</span>
                        <span className="flex items-center gap-1 text-zinc-400">
                          <Clock className="w-3.5 h-3.5 text-cyan-400" /> {item.duration}
                        </span>
                      </div>

                      {/* Action Play Recording Button */}
                      <Button 
                        className="w-full h-11 rounded-2xl border border-cyan-500/40 bg-transparent text-cyan-400 hover:bg-cyan-500/10 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" /> PLAY RECORDING
                      </Button>

                    </CardContent>
                  </Card>
                ))}
              </div>

            </div>
          )}
        </main>

      </div>
    </ParentLayout>
  );
}