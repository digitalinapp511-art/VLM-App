// src/pages/ParentDashboard.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Award, Clock, FileText, CheckCircle2, ShieldCheck, Cpu, Users, ChevronLeft, Check } from "lucide-react";
import ParentLayout from "@/components/layout/ParentLayout";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { PATHS } from "@/routes/paths";

export default function ParentDashboard() {
  const navigate = useNavigate();
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
  const [isSwitchOpen, setIsSwitchOpen] = useState(false);

  const { data: dashboardData, isLoading } = useQuery<any>({
    queryKey: ["parentDashboard"],
    queryFn: async () => {
      const { data } = await apiClient.get("/parent/dashboard");
      return data.data;
    }
  });

  const children = dashboardData?.children || [];

  useEffect(() => {
    if (!isLoading && children.length === 0) {
      navigate(PATHS.ADD_CHILD, { replace: true });
    }
  }, [isLoading, children.length, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-zinc-500 font-bold uppercase tracking-wider text-xs">
        Loading Dashboard...
      </div>
    );
  }

  if (children.length === 0) {
    return null; // will redirect via useEffect
  }

  const activeChildObj = children[selectedChildIndex] || children[0];
  const activeStudent = activeChildObj.student || {};
  const activeStats = activeChildObj.stats || {};
  const recentSessions = activeChildObj.recentSessions || [];

  const studentName = activeStudent.fullName || "Student";
  const studentClass = activeStudent.class || "N/A";
  const studentBoard = activeStudent.board || "N/A";

  return (
    <ParentLayout>
      {/* BRANDING HEADER */}
      <header className="text-center mb-4">
        <h1 style={{ fontFamily: 'Cinzel, serif' }} className="text-2xl font-bold tracking-[0.1em] text-[#D4AF37]">
          VLMACADEMY
        </h1>
        <p className="text-[8px] tracking-[0.4em] font-bold text-[#D4AF37]/70 uppercase mt-0.5">
          Parent Module
        </p>
      </header>

      {/* PROFILE SECTION */}
      <section className="flex items-center gap-15 p-6 rounded-[32px] border border-white/5 bg-white/[0.02] backdrop-blur-md mb-4 w-full">
        <div className="relative">
          {/* Avatar Glow */}
          <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full" />
          <div className="relative p-0.5 rounded-full border border-white/10">
            <Avatar className="h-16 w-16 border border-white/20">
              <AvatarImage src={activeStudent.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${studentName}`} />
              <AvatarFallback>{studentName[0]}</AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className="space-y-0.5 text-left flex-1">
          <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest leading-none">Child Profile</p>
          <h2 className="text-xl font-bold text-white tracking-tight leading-none mt-1">{studentName}</h2>
          <p className="text-xs text-white/60 leading-none mt-1">
            {String(studentClass).toLowerCase().includes("grade") || String(studentClass).toLowerCase().includes("preschool")
              ? studentClass
              : `Grade ${studentClass}`} - {studentBoard}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSwitchOpen(true)}
            className="mt-2 h-7 rounded-full bg-white/5 border-white/10 text-white/70 text-[10px] px-3 gap-1.5 cursor-pointer"
          >
            <Users size={12} /> Switch / Add Child
          </Button>
        </div>
      </section>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <StatCard
          icon={Award}
          label="Academic Score"
          value={`${activeStats.totalPoints ?? 0} PTS`}
          color="border-cyan-500/20"
          iconBg="bg-cyan-500/10 text-cyan-400"
        />
        <StatCard
          icon={Clock}
          label="Study Time"
          value={`${activeStats.streak ?? 0} Days`}
          color="border-purple-500/20"
          iconBg="bg-purple-500/10 text-purple-400"
        />
        <StatCard
          icon={FileText}
          label="Weak Subjects"
          value={`${activeStats.totalSessions ?? 0} Asked`}
          color="border-orange-500/20"
          iconBg="bg-orange-500/10 text-orange-400"
        />
        <StatCard
          icon={CheckCircle2}
          label="Doubt Solved"
          value={`${activeStats.resolvedDoubts ?? 0}`}
          color="border-blue-500/20"
          iconBg="bg-blue-500/10 text-blue-400"
        />
      </div>

      {/* FULL WIDTH CARDS */}
      <div className="space-y-3">
        <motion.div
          whileTap={{ scale: 0.98 }}
          className="w-full p-3 rounded-2xl border border-cyan-500/20 bg-[#1a1a1a]/40 backdrop-blur-3xl flex items-center gap-3 text-left shadow-md"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-[9px] text-zinc-400 font-semibold uppercase tracking-wider leading-none">Plan Status</p>
            <p className="text-sm font-bold text-white mt-1 capitalize">Active - {activeStats.subscription?.status || "Premium"}</p>
          </div>
        </motion.div>

        <motion.div
          className="w-full p-3 rounded-2xl border border-[#D4AF37]/20 bg-[#1a1a1a]/40 backdrop-blur-3xl flex items-center gap-3 text-left shadow-md"
        >
          <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center shrink-0">
            <Cpu size={20} />
          </div>
          <div className="flex-1">
            <p className="text-[9px] text-[#D4AF37]/80 font-semibold uppercase tracking-wider leading-none">AI Insight</p>
            <p className="text-xs text-white/80 leading-relaxed font-medium mt-1">
              Math is weak - practice recommended
            </p>
          </div>
        </motion.div>
      </div>

      {/* Switch Child Modal */}
      {isSwitchOpen && (
        <div className="fixed inset-0 z-[100] bg-[#050505] flex flex-col justify-between p-6 pb-12 animate-in fade-in duration-300">

          {/* Header */}
          <header className="relative w-full flex items-center justify-center pt-4 pb-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSwitchOpen(false)}
              className="absolute left-0 w-9 h-9 rounded-xl border border-white/10 bg-white/5 text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <h2 className="text-sm font-bold tracking-[0.2em] text-white uppercase mt-0.5">
              SWITCH PROFILE
            </h2>
          </header>

          {/* Children Grid */}
          <main className="flex-1 flex flex-col justify-center my-6 max-w-md mx-auto w-full">
            <div className="grid grid-cols-2 gap-4">
              {children.map((child: any, idx: number) => {
                const sName = child.student?.fullName || "Student";
                const sClass = child.student?.class || "N/A";
                const isSelected = idx === selectedChildIndex;

                return (
                  <motion.button
                    key={child.student?._id || idx}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setSelectedChildIndex(idx);
                      setIsSwitchOpen(false);
                    }}
                    className={cn(
                      "relative p-5 rounded-[24px] border text-center flex flex-col items-center justify-center aspect-[1/1.1] transition-all cursor-pointer shadow-lg bg-[#1a1a1a]/40 backdrop-blur-3xl",
                      isSelected
                        ? "border-[#D4AF37] ring-1 ring-[#D4AF37]/50 shadow-[0_0_20px_rgba(212,175,55,0.1)]"
                        : "border-white/5 hover:bg-white/5"
                    )}
                  >
                    {/* Selected Checkmark Badge */}
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#D4AF37] flex items-center justify-center text-zinc-950 shadow-md">
                        <Check className="w-3.5 h-3.5 stroke-[3.5]" />
                      </div>
                    )}

                    <div className="relative p-0.5 rounded-full border border-white/10">
                      <Avatar className="h-16 w-16 border border-white/20">
                        <AvatarImage src={child.student?.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sName}`} />
                        <AvatarFallback>{sName[0]}</AvatarFallback>
                      </Avatar>
                    </div>

                    <p className="text-sm font-bold text-white mt-4 truncate max-w-full px-1">
                      {sName}
                    </p>
                    <p className="text-[10px] text-zinc-400 mt-1 font-medium">
                      {String(sClass).toLowerCase().includes("grade") || String(sClass).toLowerCase().includes("preschool")
                        ? sClass
                        : `Grade ${sClass}`}
                    </p>
                  </motion.button>
                );
              })}
            </div>
          </main>

          {/* Action button */}
          <footer className="w-full max-w-md mx-auto pb-4 space-y-3">
            <div className="relative">
              <div className="absolute inset-x-0 bottom-1 h-10 bg-blue-600/10 blur-[15px] rounded-full pointer-events-none" />
              <Button
                onClick={() => {
                  setIsSwitchOpen(false);
                  navigate(PATHS.ADD_CHILD);
                }}
                className="w-full h-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-900 border border-blue-500/40 text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xl active:scale-[0.98] transition-all"
              >
                + Add New Child
              </Button>
            </div>
          </footer>
        </div>
      )}
    </ParentLayout>
  );
}

// Internal Stat Card Component
function StatCard({ icon: Icon, label, value, color, iconBg }: any) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={cn("p-4 rounded-2xl border bg-[#1a1a1a]/40 backdrop-blur-3xl flex items-center gap-3.5 text-left min-h-[92px] shadow-lg", color)}
    >
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", iconBg)}>
        <Icon size={22} />
      </div>
      <div className="space-y-0.5">
        <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider leading-none">{label}</p>
        <p className="text-base font-bold text-white tracking-tight mt-1">{value}</p>
      </div>
    </motion.div>
  );
}