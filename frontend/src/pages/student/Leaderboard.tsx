import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { ChevronLeft, Trophy, Star, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { useStudentProfile } from "@/hooks/use-student";

type TabType = "Class" | "City" | "State" | "Global";

interface LeaderboardUser {
  rank: number;
  nickname: string;
  points: number;
  avatar: string;
  badge?: string;
  isCurrentUser?: boolean;
}

export default function Leaderboard() {
  const navigate = useNavigate();
  const { data: profile } = useStudentProfile();
  const [activeTab, setActiveTab] = useState<TabType>("Global");

  const student = (profile as any)?.data ?? profile;
  const currentStudentName = student?.nickname || student?.fullName || "Aryan";

  // Mock scores dataset representing different filter views
  const leaderboardData: Record<TabType, LeaderboardUser[]> = {
    Global: [
      { rank: 1, nickname: "Star_Student_A", points: 25000, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Star" },
      { rank: 2, nickname: "BrightMind_B", points: 22500, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bright" },
      { rank: 3, nickname: "Samarthdi_C", points: 20000, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sam" },
      { rank: 4, nickname: currentStudentName, points: 18000, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aryan", badge: "Rising Scholar", isCurrentUser: true },
      { rank: 5, nickname: "Bright", points: 17000, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Brights", badge: "Rising Scholar" },
    ],
    Class: [
      { rank: 1, nickname: "Math_Pro", points: 24200, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pro" },
      { rank: 2, nickname: "Exam_Cracker", points: 21000, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Crack" },
      { rank: 3, nickname: currentStudentName, points: 18000, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aryan", badge: "Class Champ", isCurrentUser: true },
      { rank: 4, nickname: "Topper_X", points: 15500, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Top" },
      { rank: 5, nickname: "Studious_Y", points: 14000, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Study" },
    ],
    City: [
      { rank: 1, nickname: "City_Star_1", points: 26000, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=City1" },
      { rank: 2, nickname: "City_Star_2", points: 23100, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=City2" },
      { rank: 3, nickname: "City_Star_3", points: 19800, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=City3" },
      { rank: 4, nickname: currentStudentName, points: 18000, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aryan", badge: "City Titan", isCurrentUser: true },
      { rank: 5, nickname: "City_Star_5", points: 16900, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=City5" },
    ],
    State: [
      { rank: 1, nickname: "State_Titan_A", points: 28000, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=State1" },
      { rank: 2, nickname: "State_Titan_B", points: 24500, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=State2" },
      { rank: 3, nickname: "State_Titan_C", points: 21900, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=State3" },
      { rank: 4, nickname: currentStudentName, points: 18000, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aryan", badge: "State Legend", isCurrentUser: true },
      { rank: 5, nickname: "State_Titan_E", points: 17200, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=State5" },
    ]
  };

  const currentList = leaderboardData[activeTab];

  return (
    <div className={cn("relative min-h-svh w-full text-white flex flex-col items-center px-6 pt-6 overflow-x-hidden pb-12", bgCss)}>
      
      {/* Background Decor Glows */}
      <div className="absolute top-[10%] left-[-20%] h-[300px] w-[300px] rounded-full bg-cyan-500/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-15%] h-[300px] w-[300px] rounded-full bg-purple-500/5 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md flex-1 flex flex-col h-full z-10">
        
        {/* ── HEADER ── */}
        <header className="relative flex w-full items-center justify-between mb-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate(PATHS.STUDENT_DASHBOARD)}
            className="h-10 w-10 rounded-xl border-white/10 bg-white/5 text-white backdrop-blur-md"
          >
            <ChevronLeft size={20} />
          </Button>
          <div className="text-center">
            <h1 className="text-sm font-black tracking-[0.2em] text-white uppercase leading-none">VLM ACADEMY</h1>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider mt-1">Leaderboard</p>
          </div>
          <div className="w-10" />
        </header>

        {/* ── FILTER TABS BAR (Capsule pill row) ── */}
        <div className="w-full bg-[#121214] border border-white/5 p-1 rounded-full flex items-center justify-between my-5">
          {(["Class", "City", "State", "Global"] as TabType[]).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex-1 text-[11px] font-black tracking-widest uppercase py-2.5 rounded-full transition-all duration-300 cursor-pointer",
                  isActive 
                    ? "bg-[#0b171c] text-cyan-400 border border-cyan-400/50 shadow-[0_0_12px_rgba(34,211,238,0.2)]" 
                    : "text-white/40 hover:text-white/80"
                )}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* ── LEADERBOARD LIST ── */}
        <div className="space-y-4 flex-1">
          {currentList.map((item) => {
            // Medals rendering for top 3
            const getRankIcon = (rank: number) => {
              if (rank === 1) return <Award className="text-yellow-500 animate-bounce" size={20} />;
              if (rank === 2) return <Award className="text-zinc-400" size={18} />;
              if (rank === 3) return <Award className="text-amber-600" size={18} />;
              return <span className="text-sm font-black text-white/50 w-5 text-center">{rank}</span>;
            };

            const getRankTrophy = (rank: number) => {
              if (rank <= 3) {
                const colors = ["text-yellow-500", "text-zinc-400", "text-amber-600"];
                return <Trophy className={colors[rank - 1]} size={16} />;
              }
              return <Star className="text-white/30" size={14} />;
            };

            return (
              <Card 
                key={item.rank}
                className={cn(
                  "border transition-all duration-300 relative overflow-hidden rounded-[1.5rem]",
                  item.isCurrentUser 
                    ? "border-cyan-400 bg-cyan-950/15 shadow-[0_0_20px_rgba(34,211,238,0.15)]" 
                    : "border-white/5 bg-[#16161a]/60 backdrop-blur-md"
                )}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Rank Badge on Left */}
                    <div className="w-8 flex justify-center shrink-0">
                      {getRankIcon(item.rank)}
                    </div>

                    {/* Avatar Bubble */}
                    <div className="h-12 w-12 rounded-full border border-white/10 bg-neutral-900 overflow-hidden shrink-0">
                      <img src={item.avatar} alt={item.nickname} className="h-full w-full object-cover" />
                    </div>

                    {/* Nickname & Points */}
                    <div className="text-left">
                      {item.isCurrentUser && (
                        <span className="text-[7px] bg-cyan-400 text-black px-1.5 py-0.5 rounded-full font-black tracking-widest uppercase mb-1 inline-block">
                          You
                        </span>
                      )}
                      <p className="text-[8px] text-white/30 font-bold uppercase tracking-wider leading-none">Nickname</p>
                      <p className="text-sm font-bold text-white tracking-wide mt-1">{item.nickname}</p>
                      <p className="text-[8px] text-white/30 font-bold uppercase tracking-wider leading-none mt-2">Points</p>
                      <p className="text-xs font-black text-cyan-400 tracking-wide mt-0.5">{item.points.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Trophy / Star on Right */}
                  <div className="text-right flex flex-col items-end gap-1">
                    <span className="text-[8px] text-white/30 font-bold uppercase tracking-wider block">
                      {item.rank <= 3 ? "Rank" : "Badge"}
                    </span>
                    <span className="text-[10px] font-bold text-white/80 block uppercase tracking-wide">
                      {item.rank <= 3 ? (item.rank === 1 ? "Gold" : item.rank === 2 ? "Silver" : "Bronze") : (item.badge || "Scholar")}
                    </span>
                    <div className="mt-1.5">
                      {getRankTrophy(item.rank)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

      </div>
    </div>
  );
}
