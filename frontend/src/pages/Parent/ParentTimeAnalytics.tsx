import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Clock, Calendar, TrendingUp } from "lucide-react";
import ParentLayout from "@/components/layout/ParentLayout";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { apiClient } from "@/lib/api-client";
import { PATHS } from "@/routes/paths";

export default function ParentTimeAnalytics() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();

  const { data: usageData, isLoading } = useQuery<any>({
    queryKey: ["childUsage", studentId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/parent/child/${studentId}/usage`);
      return data.data;
    },
    enabled: !!studentId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-zinc-500 font-bold uppercase tracking-wider text-xs">
        Loading Usage Analytics...
      </div>
    );
  }

  const student = usageData?.student || {};
  const usageList = usageData?.usage || [];
  const studentName = student.fullName || "Student";

  // Calculate total study time this week
  const totalSeconds = usageList.reduce((acc: number, curr: any) => acc + (curr.activeSeconds || 0), 0);
  const totalHours = (totalSeconds / 3600).toFixed(1);

  // Find max usage to scale the bar chart
  const maxSeconds = Math.max(...usageList.map((u: any) => u.activeSeconds || 0), 3600); // at least 1 hour to prevent division by zero

  // Format short day name (e.g. Monday -> Mon)
  const getShortDay = (dayName: string) => {
    return dayName.substring(0, 3);
  };

  // Format usage time for display
  const formatUsageTime = (seconds: number) => {
    if (!seconds || seconds <= 0) return "0h 0m";
    const mins = Math.floor(seconds / 60);
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  return (
    <ParentLayout>
      <div className="max-w-xl w-full flex flex-col gap-6 pt-2 pb-6">
        {/* Header */}
        <header className="relative w-full flex items-center justify-center z-20">
          <button
            onClick={() => navigate(PATHS.PARENT_DASHBOARD)}
            className="absolute left-0 w-9 h-9 rounded-xl border border-white/10 bg-white/5 text-white flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="text-center">
            <span style={{ fontFamily: 'Cinzel, serif' }} className="text-xs font-bold text-[#D4AF37] tracking-[0.3em] uppercase block">
              VLM ACADEMY
            </span>
            <h1 className="text-base font-bold text-white tracking-wide mt-1">
              Time Analytics
            </h1>
          </div>
        </header>

        {/* Child profile banner */}
        <section className="flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-white/[0.01] backdrop-blur-md w-full">
          <Avatar className="h-10 w-10 border border-white/20">
            <AvatarImage src={student.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${studentName}`} />
            <AvatarFallback>{studentName[0]}</AvatarFallback>
          </Avatar>
          <div className="text-left">
            <h3 className="text-sm font-bold text-white">{studentName}</h3>
            <p className="text-[10px] text-zinc-400">Weekly app use and active learning tracker</p>
          </div>
        </section>

        {/* ── CARD 1: WEEKLY SUMMARY ── */}
        <div className="p-6 rounded-[28px] border border-white/5 bg-white/[0.02] backdrop-blur-md w-full flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-6 pl-2">
            <span className="text-[10px] font-black text-zinc-400 tracking-wider uppercase">
              STUDY TIME THIS WEEK
            </span>
            <span className="text-xs font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-1 rounded-full">
              {totalHours} hrs
            </span>
          </div>

          {/* Weekly Bar Chart */}
          <div className="w-full relative h-[180px] flex items-end justify-between px-2 pt-6">
            {usageList.map((day: any, idx: number) => {
              const seconds = day.activeSeconds || 0;
              const barHeightPct = Math.max(8, (seconds / maxSeconds) * 80); // scale up to 80% max
              const hoursVal = (seconds / 3600).toFixed(1);

              return (
                <div key={idx} className="flex flex-col items-center flex-1 group">
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-[160px] bg-zinc-900 border border-white/10 text-white text-[9px] font-black py-1 px-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md">
                    {formatUsageTime(seconds)}
                  </div>

                  {/* Hours badge above bar */}
                  <span className="text-[9px] font-black text-zinc-400 mb-2 font-mono">
                    {parseFloat(hoursVal) > 0 ? `${hoursVal}h` : "-"}
                  </span>

                  {/* Vertical bar */}
                  <div className="w-6 bg-gradient-to-t from-violet-600 to-indigo-500 rounded-t-lg transition-all duration-500 relative" style={{ height: `${barHeightPct}%` }}>
                    <div className="absolute inset-x-0 top-0 h-1 bg-white/20 rounded-t-lg" />
                  </div>

                  {/* Day label */}
                  <span className="text-[10px] font-bold text-zinc-500 mt-2">
                    {getShortDay(day.dayName)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── CARD 2: DAILY BREAKDOWN LOGS ── */}
        <div className="p-6 rounded-[28px] border border-white/5 bg-white/[0.02] backdrop-blur-md w-full flex flex-col">
          <span className="text-[10px] font-black text-zinc-400 tracking-wider uppercase mb-4 pl-2 text-left">
            DAILY BREAKDOWN
          </span>

          <div className="divide-y divide-white/5">
            {usageList.map((day: any, idx: number) => {
              const seconds = day.activeSeconds || 0;
              return (
                <div key={idx} className="py-3.5 flex justify-between items-center text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-zinc-400">
                      <Calendar size={14} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{day.dayName}</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">{day.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-white font-mono">{formatUsageTime(seconds)}</p>
                    <p className="text-[9px] text-zinc-500 font-medium uppercase mt-0.5">study time</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ParentLayout>
  );
}
