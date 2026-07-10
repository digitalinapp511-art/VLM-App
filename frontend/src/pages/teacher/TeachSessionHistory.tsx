import React, { useState } from "react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import SessionFilterTabs from "@/components/basic/teacher/SessionFilters";
import SessionCard from "@/components/basic/teacher/SessionItemCard";
import { Layers, ChevronLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { teacherApi } from "@/lib/teacher-api";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { Skeleton } from "@/components/ui/skeleton";

const TeachSessionHistory: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("chat");

  const { data: dbSessions, isLoading } = useQuery({
    queryKey: ["teacherSessions"],
    queryFn: () => teacherApi.getSessions(),
  });

  const parsedSessions = (dbSessions || []).map((s: any) => {
    const isResolved = s.status === "resolved" || s.status === "completed" || s.status === "active";
    const durationSeconds = s.duration || 0;
    const minutes = Math.floor(durationSeconds / 60);
    const seconds = durationSeconds % 60;
    const durationStr = minutes > 0 
      ? (seconds > 0 ? `${minutes} mins ${seconds} secs` : `${minutes} mins`)
      : `${seconds} secs`;

    // 10 credits/min earnings format
    const earningsValue = ((durationSeconds / 60) * 10).toFixed(2);

    return {
      studentName: s.studentId?.nickname || s.studentId?.fullName || "Student",
      grade: s.studentId?.class ? `Class ${s.studentId.class}` : "Class 12th",
      subject: s.subject || "General Doubt",
      duration: durationStr,
      earnings: earningsValue,
      date: new Date(s.createdAt).toLocaleString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      }),
      status: isResolved ? ("RESOLVED" as const) : ("UNRESOLVED" as const),
      type: s.type || "chat",
      studentAvatar: s.studentId?.profilePhoto || s.studentId?.avatar || "",
    };
  });

  const filteredSessions = parsedSessions.filter((s: any) => s.type === activeTab);

  return (
    <div className={cn("min-h-screen flex flex-col items-center bg-[#050505] p-4 pb-12", bgCss)}>
      <div className="w-full max-w-xl">
        {/* Header */}
        <header className="flex items-center justify-between py-6">
          <button
            onClick={() => navigate(PATHS.TEACHER_DASHBOARD)}
            className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-zinc-950/40 text-white hover:bg-white/10 transition-all active:scale-95 cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-black text-white tracking-[0.15em] uppercase">
            Session History
          </h1>
          <div className="w-10" />
        </header>

        {/* Filter Tabs */}
        <SessionFilterTabs activeTab={activeTab} onChange={setActiveTab} />

        {/* Sessions List */}
        <div className="mt-2">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full rounded-[32px] bg-zinc-900/50" />
              <Skeleton className="h-32 w-full rounded-[32px] bg-zinc-900/50" />
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="p-8 text-center space-y-3 rounded-3xl border border-white/5 bg-zinc-900/20 backdrop-blur-md">
              <Layers className="h-12 w-12 mx-auto text-zinc-650" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">No Sessions Found</h3>
              <p className="text-xs text-zinc-500">No session logs found under this filter type.</p>
            </div>
          ) : (
            filteredSessions.map((session: any, index: number) => (
              <SessionCard key={index} {...session} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TeachSessionHistory;