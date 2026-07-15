import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { 
  Menu, Wallet, Bell, Trophy, Star, Award, 
  ChevronDown, GraduationCap, Calendar, Flame,
  User as UserIcon, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useStudentProfile, useDashboard } from "@/hooks/use-student";
import { useQuery } from "@tanstack/react-query";
import { studentApi } from "@/lib/student-api";
import StudentBottomNav from "@/features/student/components/layout/StudentBottomNav";
import logoImg from "@/assets/logo.png";

type TabType = "Class" | "City" | "State" | "Global";

interface LeaderboardUser {
  rank: number;
  nickname: string;
  points: number;
  avatar: string;
  badge?: string;
  level: string;
  streak: number;
  isCurrentUser?: boolean;
}

export default function Leaderboard() {
  const navigate = useNavigate();
  const { data: profile } = useStudentProfile();
  const { data: dashboardRaw } = useDashboard();
  const [activeTab, setActiveTab] = useState<TabType>("Class");
  const [selectedClass, setSelectedClass] = useState("Class 10");
  const [selectedTimeframe, setSelectedTimeframe] = useState("This Week");

  const student = (profile as any)?.data ?? profile;
  const dashboardData = (dashboardRaw as any)?.data ?? dashboardRaw ?? {};
  const unreadCount = dashboardData?.unreadNotificationCount ?? 0;

  // Fetch dynamic leaderboard data sorted by MCQ Points
  const { data: leaderboardRaw, isLoading } = useQuery({
    queryKey: ["leaderboard", activeTab],
    queryFn: () => studentApi.getLeaderboard(activeTab),
  });

  const list = leaderboardRaw?.data || [];

  // Combine real database records
  const combinedList = [...list];

  // Ensure current user is in the list
  if (student && !combinedList.some(u => u._id === student._id)) {
    combinedList.push({
      _id: student._id,
      fullName: student.fullName,
      nickname: student.nickname || student.fullName?.split(' ')[0],
      mcqPoints: student.mcqPoints || 0,
      streak: student.streak || 0,
      avatarUrl: student.profilePhoto,
    });
  }

  // Sort and select top 25
  const sortedList = combinedList
    .sort((a, b) => (b.mcqPoints || 0) - (a.mcqPoints || 0))
    .slice(0, 25);

  const mappedList: LeaderboardUser[] = sortedList.map((user: any, index: number) => {
    const points = user.mcqPoints || 0;
    let tier = "Bronze";
    if (points >= 1000) tier = "Diamond";
    else if (points >= 600) tier = "Platinum";
    else if (points >= 300) tier = "Gold";
    else if (points >= 100) tier = "Silver";

    return {
      rank: index + 1,
      nickname: user.nickname || user.fullName?.split(' ')[0] || "Student",
      points: points,
      avatar: user.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fullName || 'Student'}`,
      level: tier,
      streak: user.streak || 0,
      isCurrentUser: user._id === student?._id,
    };
  });

  // Divide into podium and list
  const rank1 = mappedList.find(u => u.rank === 1);
  const rank2 = mappedList.find(u => u.rank === 2);
  const rank3 = mappedList.find(u => u.rank === 3);
  const remainingList = mappedList.filter(u => u.rank > 3);

  // Find current user's rank
  const currentUserRank = mappedList.find(u => u.isCurrentUser);

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#f4f6ff] dark:bg-[#0b081e] text-slate-800 dark:text-slate-100 transition-colors duration-300 pb-32">
      
      {/* ── TOP APP HEADER ── */}
      <header className="w-full max-w-3xl mx-auto flex items-center justify-between px-5 pt-3 pb-1 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(PATHS.STUDENT_DASHBOARD)}
            className="h-10 w-10 rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-center text-slate-655 dark:text-slate-300 hover:text-slate-855 active:scale-90 transition-transform"
          >
            <Menu size={20} />
          </button>
          <img src={logoImg} alt="VLM Academy Logo" className="h-12 w-auto object-contain" />
        </div>

        <div className="flex items-center gap-2">
          {/* Wallet */}
          <button
            onClick={() => navigate(PATHS.WALLET)}
            className="h-9 w-9 rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <Wallet size={18} className="text-violet-600 dark:text-violet-400" />
          </button>

          {/* Notifications */}
          <button
            onClick={() => navigate(PATHS.STUDENT_NOTIFICATIONS)}
            className="relative h-9 w-9 rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-center"
          >
            <Bell size={18} className="text-slate-600 dark:text-slate-300" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full border border-white dark:border-slate-900" />
            )}
          </button>

          {/* Avatar */}
          <Avatar className="h-9 w-9 border border-slate-200 dark:border-slate-800">
            <AvatarImage src={student?.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student?.fullName || 'Student'}`} />
            <AvatarFallback>{student?.fullName?.[0] || 'S'}</AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* ── TITLE SECTION WITH LAURELS ── */}
      <div className="flex flex-col items-center justify-center my-1 text-center px-4 shrink-0">
        <div className="flex items-center gap-2.5">
          <svg className="w-7 h-7 text-[#6366f1] fill-current" viewBox="0 0 24 24">
            <path d="M12 2a1 1 0 0 1 .8.4l1.6 2.2a1 1 0 0 1-.1 1.3 1 1 0 0 1-1.3-.1L12 4.4l-.9 1.4a1 1 0 0 1-1.4.2 1 1 0 0 1-.2-1.4l1.7-2.2A1 1 0 0 1 12 2zm-5 5a1 1 0 0 1 .1 1.4c-1.3 1.5-2 3.4-2 5.6 0 3.9 2.9 7 6.5 7.4a1 1 0 1 1-.2 2C6.8 23 3 19 3 14c0-2.8 1-5.3 2.6-7.1A1 1 0 0 1 7 7zm10 0a1 1 0 0 1 1.4-.1C20 8.7 21 11.2 21 14c0 5-3.8 9-8.4 9.4a1 1 0 1 1-.2-2c3.6-.4 6.5-3.5 6.5-7.4 0-2.2-.7-4.1-2-5.6A1 1 0 0 1 17 7zm-5 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8z"/>
          </svg>
          <h2 className="text-xl font-black text-slate-855 dark:text-white uppercase tracking-tight">Leaderboard</h2>
          <svg className="w-7 h-7 text-[#6366f1] fill-current transform scale-x-[-1]" viewBox="0 0 24 24">
            <path d="M12 2a1 1 0 0 1 .8.4l1.6 2.2a1 1 0 0 1-.1 1.3 1 1 0 0 1-1.3-.1L12 4.4l-.9 1.4a1 1 0 0 1-1.4.2 1 1 0 0 1-.2-1.4l1.7-2.2A1 1 0 0 1 12 2zm-5 5a1 1 0 0 1 .1 1.4c-1.3 1.5-2 3.4-2 5.6 0 3.9 2.9 7 6.5 7.4a1 1 0 1 1-.2 2C6.8 23 3 19 3 14c0-2.8 1-5.3 2.6-7.1A1 1 0 0 1 7 7zm10 0a1 1 0 0 1 1.4-.1C20 8.7 21 11.2 21 14c0 5-3.8 9-8.4 9.4a1 1 0 1 1-.2-2c3.6-.4 6.5-3.5 6.5-7.4 0-2.2-.7-4.1-2-5.6A1 1 0 0 1 17 7zm-5 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8z"/>
          </svg>
        </div>
        <p className="text-[9px] font-black text-[#6366f1] tracking-widest uppercase mt-0.5">✦ Compete. Learn. Rise. ✦</p>
      </div>

      <div className="w-full max-w-md mx-auto px-4 flex flex-col flex-1">
        
        {/* ── FILTER CAPSULE TABS ── */}
        <div className="w-full bg-white dark:bg-[#161233] border border-slate-100 dark:border-[#221c4e] p-1 rounded-full flex items-center justify-between shadow-sm shrink-0">
          {(["Class", "City", "State", "Global"] as TabType[]).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex-1 text-[9px] font-black tracking-widest uppercase py-2 rounded-full transition-all duration-300 cursor-pointer border-none",
                  isActive 
                    ? "bg-[#6366f1] text-white shadow-md shadow-indigo-500/20" 
                    : "text-slate-450 dark:text-slate-500 hover:text-slate-655 dark:hover:text-slate-350 bg-transparent"
                )}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* ── DROPDOWNS BAR ── */}
        <div className="flex items-center justify-center gap-3 my-2 shrink-0">
          <button className="h-8 px-3 rounded-full bg-white dark:bg-[#161233] border border-slate-150 dark:border-[#221c4e] shadow-sm flex items-center gap-1.5 text-[9px] font-black text-slate-700 dark:text-slate-300 cursor-pointer">
            <GraduationCap size={12} className="text-[#6366f1]" />
            <span>{selectedClass}</span>
            <ChevronDown size={11} className="text-slate-400" />
          </button>

          <button className="h-8 px-3 rounded-full bg-white dark:bg-[#161233] border border-slate-150 dark:border-[#221c4e] shadow-sm flex items-center gap-1.5 text-[9px] font-black text-slate-700 dark:text-slate-300 cursor-pointer">
            <Calendar size={11} className="text-[#6366f1]" />
            <span>{selectedTimeframe}</span>
            <ChevronDown size={11} className="text-slate-400" />
          </button>
        </div>

        {/* ── 3D PODIUM SECTION ── */}
        <div className="relative w-full rounded-t-[2rem] bg-gradient-to-b from-[#2e1a8f] to-[#0e0735] p-4 pb-5 overflow-hidden flex flex-col justify-end min-h-[180px] shadow-md shrink-0">
          {/* Sparkly grid details */}
          <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px]" />
          
          <div className="flex items-end justify-center w-full gap-2 mt-4 relative z-10">
            
            {/* Rank 2 (Left) */}
            {rank2 ? (
              <div className="flex flex-col items-center flex-1">
                <div className="relative mb-1 flex flex-col items-center">
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 scale-90">
                    👑
                  </div>
                  <Avatar className="h-12 w-12 border-2 border-slate-300 shadow-md">
                    <AvatarImage src={rank2.avatar} />
                    <AvatarFallback>2</AvatarFallback>
                  </Avatar>
                  <div className="bg-white/95 border border-slate-200 text-slate-800 text-[8px] font-black rounded px-1.5 py-0.5 shadow-sm mt-1 w-16 text-center truncate">
                    {rank2.nickname}
                  </div>
                  <span className="bg-[#6366f1] text-white text-[5.5px] font-black px-1.5 py-0.5 rounded-full mt-0.5 scale-90">
                    {rank2.level}
                  </span>
                  <span className="text-[9px] font-black text-slate-200 mt-0.5">
                    {rank2.points.toLocaleString()} XP
                  </span>
                </div>
                <div className="w-full bg-gradient-to-b from-slate-200 to-slate-400 h-10 rounded-t-lg flex items-center justify-center shadow border-t border-slate-100">
                  <span className="text-xl font-black text-slate-655 opacity-90">2</span>
                </div>
              </div>
            ) : (
              <div className="flex-1" />
            )}

            {/* Rank 1 (Center) */}
            {rank1 ? (
              <div className="flex flex-col items-center flex-1 -mt-4">
                <div className="relative mb-1 flex flex-col items-center">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                    👑
                  </div>
                  <Avatar className="h-14 w-14 border-2 border-yellow-400 shadow-lg ring-4 ring-yellow-400/20">
                    <AvatarImage src={rank1.avatar} />
                    <AvatarFallback>1</AvatarFallback>
                  </Avatar>
                  <div className="bg-yellow-400 border border-yellow-500 text-slate-900 text-[9px] font-black rounded px-2 py-0.5 shadow-md mt-1 w-20 text-center truncate">
                    {rank1.nickname}
                  </div>
                  <span className="bg-[#6366f1] text-white text-[6px] font-black px-1.5 py-0.5 rounded-full mt-0.5">
                    {rank1.level}
                  </span>
                  <span className="text-[10px] font-black text-yellow-400 mt-0.5">
                    {rank1.points.toLocaleString()} XP
                  </span>
                </div>
                <div className="w-full bg-gradient-to-b from-yellow-400 to-yellow-600 h-14 rounded-t-lg flex items-center justify-center shadow-md border-t border-yellow-300">
                  <span className="text-2xl font-black text-yellow-900 opacity-95">1</span>
                </div>
              </div>
            ) : (
              <div className="flex-1" />
            )}

            {/* Rank 3 (Right) */}
            {rank3 ? (
              <div className="flex flex-col items-center flex-1">
                <div className="relative mb-1 flex flex-col items-center">
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 scale-90">
                    👑
                  </div>
                  <Avatar className="h-12 w-12 border-2 border-amber-600 shadow-md">
                    <AvatarImage src={rank3.avatar} />
                    <AvatarFallback>3</AvatarFallback>
                  </Avatar>
                  <div className="bg-white/95 border border-slate-200 text-slate-800 text-[8px] font-black rounded px-1.5 py-0.5 shadow-sm mt-1 w-16 text-center truncate">
                    {rank3.nickname}
                  </div>
                  <span className="bg-[#6366f1] text-white text-[5.5px] font-black px-1.5 py-0.5 rounded-full mt-0.5 scale-90">
                    {rank3.level}
                  </span>
                  <span className="text-[9px] font-black text-slate-200 mt-0.5">
                    {rank3.points.toLocaleString()} XP
                  </span>
                </div>
                <div className="w-full bg-gradient-to-b from-amber-600 to-amber-800 h-8 rounded-t-lg flex items-center justify-center shadow border-t border-amber-500">
                  <span className="text-lg font-black text-amber-955 opacity-90">3</span>
                </div>
              </div>
            ) : (
              <div className="flex-1" />
            )}

          </div>
        </div>

        {/* ── TALLER SCROLLABLE LIST OF STUDENTS (Ranks 4+) ── */}
        <Card className="w-full border-none bg-white dark:bg-[#161233] shadow-md rounded-t-none rounded-b-[2rem] overflow-hidden -mt-1 relative z-20 flex flex-col h-[340px]">
          <CardContent className="p-3 flex-1 flex flex-col justify-between overflow-hidden">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-6 text-slate-455 gap-2 flex-1">
                <div className="h-5 w-5 rounded-full border-2 border-[#6366f1] border-t-transparent animate-spin" />
                <span className="text-[9px] font-bold uppercase tracking-wider">Loading Rankings...</span>
              </div>
            ) : remainingList.length === 0 ? (
              <div className="flex items-center justify-center py-6 text-slate-400 text-[10px] font-black uppercase tracking-wider flex-1">
                No Rankings Listed
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 space-y-2.5 flex-1 overflow-y-auto pr-1 no-scrollbar">
                {remainingList.map((item) => (
                  <div key={item.rank} className="flex items-center justify-between pt-2.5 first:pt-0">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 text-xs font-black text-slate-855 dark:text-white text-center">
                        {item.rank}
                      </span>
                      <Avatar className="h-8 w-8 border border-slate-100 dark:border-slate-800 shadow-sm shrink-0">
                        <AvatarImage src={item.avatar} />
                        <AvatarFallback>{item.nickname[0]}</AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <h4 className="text-xs font-bold text-slate-855 dark:text-white leading-tight">
                          {item.nickname}
                        </h4>
                        <span className="inline-block bg-[#f0f0ff] dark:bg-violet-955/20 text-[#6366f1] text-[6.5px] font-black px-1.5 py-0.2 rounded-full scale-95 origin-left">
                          {item.level}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {item.streak > 0 && (
                        <div className="flex items-center gap-0.5">
                          <Flame size={11} className="text-orange-500 fill-orange-500" />
                          <span className="text-[9px] font-black text-slate-700 dark:text-slate-300">{item.streak}</span>
                        </div>
                      )}
                      <span className="text-xs font-black text-slate-855 dark:text-white text-right">
                        {item.points.toLocaleString()} XP
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* View Full Leaderboard Footer Button */}
            <button className="w-full mt-2 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-955/20 hover:bg-indigo-100/70 border-none text-[#6366f1] font-black text-[9px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>View Full Leaderboard</span>
              <ArrowRight size={10} className="stroke-[3px]" />
            </button>

          </CardContent>
        </Card>

        {/* ── YOUR RANK FLOATING BAR ── */}
        {currentUserRank && (
          <div className="fixed bottom-[86px] left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-3 shadow-lg flex items-center justify-between text-white overflow-hidden z-[90]">
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px]" />
            
            <div className="flex items-center gap-2.5 relative z-10">
              <div className="text-left">
                <span className="text-[6.5px] text-white/70 uppercase tracking-widest font-black flex items-center gap-0.5 leading-none">
                  <UserIcon size={7} />
                  Your Rank
                </span>
                <h3 className="text-xl font-black text-white mt-0.5 leading-none">
                  #{currentUserRank.rank}
                </h3>
              </div>

              <div className="h-6 w-px bg-white/20 mx-0.5" />

              <Avatar className="h-8 w-8 border border-white/20 shadow-sm shrink-0">
                <AvatarImage src={currentUserRank.avatar} />
                <AvatarFallback>Y</AvatarFallback>
              </Avatar>

              <div className="text-left">
                <span className="bg-yellow-400 text-slate-900 text-[5.5px] font-black px-1.2 py-0.2 rounded uppercase tracking-wider inline-block">
                  You
                </span>
                <h4 className="text-xs font-black text-white leading-tight mt-0.5">
                  {student?.nickname || student?.fullName || "Aryan"}
                </h4>
                <p className="text-[7px] font-black text-green-300 flex items-center gap-0.5 leading-none mt-0.5 font-bold">
                  Level {currentUserRank.level}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-white/10 rounded-lg px-2 py-1 border border-white/10 relative z-10 shrink-0">
              <Star size={11} className="text-yellow-400 fill-yellow-400" />
              <span className="text-[10px] font-black tracking-wide text-white">
                {currentUserRank.points.toLocaleString()} XP
              </span>
            </div>
          </div>
        )}

      </div>

      {/* Docked bottom nav */}
      <StudentBottomNav />
    </div>
  );
}
