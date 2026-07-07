import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Grid, Info, MessageSquare, Play, UserCheck, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import StudentBottomNav from "@/features/student/components/layout/StudentBottomNav";

type CreatorInfo = {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  followers: number;
  following: number;
  shortsCount: number;
  shorts: Array<{
    id: string;
    title: string;
    views: string;
    videoBg: string;
  }>;
};

const CREATOR_DATA: Record<string, CreatorInfo> = {
  "reel-1": {
    id: "reel-1",
    name: "Priya Sharma",
    username: "PhysicsWithPriya",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=priya",
    bio: "Physics Educator & Quantum Theory enthusiast. Making complex sciences super simple for school students! 🔬🌌",
    followers: 12500,
    following: 142,
    shortsCount: 15,
    shorts: [
      { id: "1", title: "Quantum Entanglement Explained", views: "2.3M", videoBg: "from-teal-950 to-emerald-950" },
      { id: "2", title: "Schrödinger's Cat Paradox", views: "980K", videoBg: "from-cyan-950 to-blue-950" },
      { id: "3", title: "Newton's Third Law in Action", views: "450K", videoBg: "from-purple-950 to-slate-950" },
      { id: "4", title: "Black Holes Demystified", views: "1.2M", videoBg: "from-indigo-950 to-pink-950" },
    ]
  },
  "reel-2": {
    id: "reel-2",
    name: "Rajesh Kumar",
    username: "MathsMagic",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maths",
    bio: "Mathematics guru. Cracking calculus and geometry shortcuts in under 30 seconds! 📐⚡",
    followers: 9800,
    following: 89,
    shortsCount: 12,
    shorts: [
      { id: "1", title: "Integration Shortcut Tricks", views: "1.8M", videoBg: "from-blue-950 to-indigo-950" },
      { id: "2", title: "Trigonometry Hexagon Cheat Code", views: "750K", videoBg: "from-rose-950 to-purple-950" },
      { id: "3", title: "Algebra Formula Hacks", views: "320K", videoBg: "from-amber-950 to-orange-950" },
    ]
  },
  "reel-3": {
    id: "reel-3",
    name: "Dr. Amit Verma",
    username: "ChemWiz",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=chem",
    bio: "Chemistry Professor & Lab Explorer. Revealing the magical chemical equations of nature! 🧪❄️",
    followers: 21000,
    following: 205,
    shortsCount: 22,
    shorts: [
      { id: "1", title: "Why Ice Floats on Water", views: "3.1M", videoBg: "from-rose-950 to-purple-950" },
      { id: "2", title: "Endothermic Reaction Experiment", views: "1.5M", videoBg: "from-emerald-950 to-teal-950" },
      { id: "3", title: "Periodic Table Memory Hack", views: "920K", videoBg: "from-sky-950 to-indigo-950" },
      { id: "4", title: "Acid Base Neutralization", views: "640K", videoBg: "from-purple-950 to-pink-950" },
    ]
  }
};

export default function CreatorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"shorts" | "about">("shorts");
  const [isFollowing, setIsFollowing] = useState(false);

  // Find creator or fall back
  const creator = (id && CREATOR_DATA[id]) || {
    id: id || "unknown",
    name: "Academic Creator",
    username: id || "tutor_vlm",
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id || "vlm"}`,
    bio: "VLM Academy certified educator dedicated to digital classroom success.",
    followers: 4320,
    following: 95,
    shortsCount: 6,
    shorts: [
      { id: "1", title: "Sample Educational Topic", views: "120K", videoBg: "from-purple-950 to-indigo-950" },
      { id: "2", title: "Exam Preparation Tips", views: "85K", videoBg: "from-pink-950 to-rose-950" },
    ]
  };

  const [followerCount, setFollowerCount] = useState(creator.followers);

  const toggleFollow = () => {
    if (isFollowing) {
      setIsFollowing(false);
      setFollowerCount(prev => prev - 1);
      toast.success(`Unfollowed @${creator.username}`);
    } else {
      setIsFollowing(true);
      setFollowerCount(prev => prev + 1);
      toast.success(`Followed @${creator.username}`);
    }
  };

  return (
    <div className="relative flex min-h-svh w-full flex-col items-center bg-[#f4f6ff] dark:bg-[#0b081e] px-6 py-8 overflow-hidden text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <div className="max-w-xl w-full flex flex-col min-h-svh pb-24">
        
        {/* ── HEADER ── */}
        <header className="flex items-center justify-between pb-6 relative z-10">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-10 w-10 rounded-xl border-slate-200 dark:border-[#221c4e] bg-white dark:bg-[#161233] text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-95 transition-all shadow-sm"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft size={20} />
          </Button>
          <h1 className="text-md font-black tracking-tight uppercase">Public Profile</h1>
          <div className="w-10 h-10" />
        </header>

        {/* ── CREATOR DETAILS CARD ── */}
        <div className="w-full rounded-[2rem] border border-slate-100 dark:border-[#221c4e] bg-white dark:bg-[#161233] p-6 shadow-sm flex flex-col items-center text-center gap-4 transition-colors duration-300">
          {/* Avatar */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 blur-[8px] opacity-70 animate-pulse" />
            <Avatar className="h-24 w-24 border-4 border-white dark:border-[#161233] rounded-full shadow-lg relative z-10">
              <AvatarImage src={creator.avatar} />
              <AvatarFallback className="bg-purple-950 text-white font-bold text-xl">U</AvatarFallback>
            </Avatar>
          </div>

          {/* Name & Username */}
          <div className="space-y-1">
            <h2 className="text-xl font-black tracking-tight">{creator.name}</h2>
            <p className="text-xs font-bold text-violet-600 dark:text-violet-400">@{creator.username}</p>
          </div>

          {/* Bio */}
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed px-2 font-medium">
            {creator.bio}
          </p>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 w-full border-t border-slate-100 dark:border-[#221c4e] pt-4 mt-1">
            <div className="flex flex-col items-center">
              <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                {followerCount >= 1000 ? `${(followerCount / 1000).toFixed(1)}K` : followerCount}
              </span>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Followers</span>
            </div>
            <div className="flex flex-col items-center border-x border-slate-100 dark:border-[#221c4e]">
              <span className="text-sm font-black text-slate-800 dark:text-slate-100">{creator.following}</span>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Following</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-sm font-black text-slate-800 dark:text-slate-100">{creator.shortsCount}</span>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Shorts</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex w-full gap-3 mt-2">
            <Button
              onClick={toggleFollow}
              className={cn(
                "flex-1 h-11 rounded-xl font-black text-xs transition-all active:scale-95 shadow-sm border-none",
                isFollowing 
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700" 
                  : "bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-400 text-white"
              )}
            >
              {isFollowing ? (
                <span className="flex items-center justify-center gap-1.5"><UserCheck size={14} /> Following</span>
              ) : (
                <span className="flex items-center justify-center gap-1.5"><UserPlus size={14} /> Follow</span>
              )}
            </Button>
            <Button
              onClick={() => toast.info("Direct messaging this creator is coming soon!")}
              variant="outline"
              className="h-11 px-4 rounded-xl border-slate-200 dark:border-[#221c4e] bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all"
            >
              <MessageSquare size={16} />
            </Button>
          </div>
        </div>

        {/* ── TAB NAV ── */}
        <div className="flex border-b border-slate-100 dark:border-[#221c4e] mt-6 mb-4">
          <button
            onClick={() => setActiveTab("shorts")}
            className={cn(
              "flex-1 pb-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all",
              activeTab === "shorts" 
                ? "border-violet-600 dark:border-violet-400 text-violet-600 dark:text-violet-400" 
                : "border-transparent text-slate-400 dark:text-slate-500"
            )}
          >
            <Grid size={14} /> Shorts
          </button>
          <button
            onClick={() => setActiveTab("about")}
            className={cn(
              "flex-1 pb-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all",
              activeTab === "about" 
                ? "border-violet-600 dark:border-violet-400 text-violet-600 dark:text-violet-400" 
                : "border-transparent text-slate-400 dark:text-slate-500"
            )}
          >
            <Info size={14} /> About
          </button>
        </div>

        {/* ── TAB CONTENT ── */}
        {activeTab === "shorts" ? (
          <div className="grid grid-cols-2 gap-4">
            {creator.shorts.map((sh) => (
              <div 
                key={sh.id}
                onClick={() => navigate("/short-video-feed")}
                className={cn(
                  "aspect-[9/16] rounded-2xl bg-gradient-to-b relative overflow-hidden p-4 flex flex-col justify-end shadow-sm group cursor-pointer active:scale-98 transition-all border border-slate-100 dark:border-[#221c4e]",
                  sh.videoBg
                )}
              >
                {/* Glow/Hover effect */}
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300" />
                
                {/* Views overlay */}
                <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm rounded-lg px-2 py-1 text-[9px] font-black flex items-center gap-1 text-white">
                  <Play size={8} className="fill-white" /> {sh.views}
                </div>

                <p className="text-xs font-black text-white relative z-10 leading-snug drop-shadow-md line-clamp-2">
                  {sh.title}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-slate-100 dark:border-[#221c4e] bg-white dark:bg-[#161233] p-6 shadow-sm flex flex-col gap-4 text-xs font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300 leading-relaxed">
            <div>
              <h4 className="font-black text-slate-800 dark:text-slate-100 mb-1 uppercase tracking-wider">Teacher Profile</h4>
              <p>Experienced subject expert helping students pass and excel in science & board exams with interactive short videos and doubt-solving sessions.</p>
            </div>
            <div>
              <h4 className="font-black text-slate-800 dark:text-slate-100 mb-1 uppercase tracking-wider">Subjects Taught</h4>
              <div className="flex gap-2 mt-1">
                <span className="px-2.5 py-1 rounded-lg bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 font-bold">Physics</span>
                <span className="px-2.5 py-1 rounded-lg bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 font-bold">Science</span>
              </div>
            </div>
          </div>
        )}

      </div>
      <StudentBottomNav />
    </div>
  );
}
