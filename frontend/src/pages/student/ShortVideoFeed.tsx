import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { 
  ChevronLeft, Heart, MessageSquare, Share2, 
  UserPlus, Play, Volume2, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type ReelVideo = {
  id: string;
  username: string;
  avatar: string;
  caption: string;
  views: string;
  likes: number;
  comments: string;
  shares: string;
  liked: boolean;
  videoBg: string; // gradient representing video colors
  topic: string;
};

export default function ShortVideoFeed() {
  const navigate = useNavigate();
  const [reels, setReels] = useState<ReelVideo[]>([
    {
      id: "reel-1",
      username: "PhysicsWithPriya",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=priya",
      caption: "Quantum Entanglement Explained Simply! ✨🔭 #stem #physics #learning #vlm #quantum",
      views: "2.3M Views",
      likes: 125000,
      comments: "8.9K",
      shares: "15K",
      liked: false,
      videoBg: "from-teal-950 via-black to-emerald-950",
      topic: "Quantum Entanglement",
    },
    {
      id: "reel-2",
      username: "MathsMagic",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maths",
      caption: "Integration shortcut trick in 10 seconds! 📐🔥 #maths #calculus #tricks #study",
      views: "1.8M Views",
      likes: 98000,
      comments: "4.2K",
      shares: "12K",
      liked: false,
      videoBg: "from-blue-950 via-black to-indigo-950",
      topic: "Integration Shortcuts",
    },
    {
      id: "reel-3",
      username: "ChemWiz",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=chem",
      caption: "Why does ice float on water? Density science experiment ❄️🧪 #chemistry #science #facts",
      views: "3.1M Views",
      likes: 210000,
      comments: "11K",
      shares: "35K",
      liked: false,
      videoBg: "from-rose-950 via-black to-purple-950",
      topic: "Density & Density Paradox",
    }
  ]);

  const [pausedReels, setPausedReels] = useState<Record<string, boolean>>({});

  const handleLike = (index: number) => {
    setReels(prev => prev.map((r, idx) => {
      if (idx === index) {
        return {
          ...r,
          liked: !r.liked,
          likes: r.liked ? r.likes - 1 : r.likes + 1
        };
      }
      return r;
    }));
  };

  const togglePlay = (id: string) => {
    setPausedReels(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const formatLikes = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(0)}K`;
    }
    return count;
  };

  return (
    <div className="h-svh w-full text-white relative bg-black select-none overflow-hidden">
      
      {/* ── STICKY HEADER OVERLAY ── */}
      <header className="absolute top-0 left-0 right-0 z-30 flex w-full max-w-md mx-auto items-center justify-between px-6 pt-6 pointer-events-none">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-10 w-10 rounded-xl border-white/10 bg-black/30 text-white backdrop-blur-md shrink-0 active:scale-95 transition-all pointer-events-auto" 
          onClick={() => navigate(PATHS.STUDENT_DASHBOARD)}
        >
          <ChevronLeft size={20} />
        </Button>
        <span className="text-sm font-black tracking-widest text-white/90 uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] pointer-events-auto">
          Short Videos
        </span>
        <button className="h-10 w-10 rounded-xl bg-black/30 border border-white/10 flex items-center justify-center text-white backdrop-blur-md active:scale-95 transition-all pointer-events-auto">
          <Volume2 size={18} />
        </button>
      </header>

      {/* ── VERTICAL SNAP CONTAINER ── */}
      <div className="h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar">
        {reels.map((reel, index) => {
          const isPaused = pausedReels[reel.id] || false;
          return (
            <div 
              key={reel.id}
              className="h-full w-full snap-start snap-always relative overflow-hidden flex flex-col justify-end pb-8 px-6 bg-black"
            >
              {/* ── BACKGROUND MOCK VIDEO FEED ── */}
              <div 
                onClick={() => togglePlay(reel.id)}
                className={cn(
                  "absolute inset-0 bg-gradient-to-b transition-all duration-700 -z-10 flex flex-col items-center justify-center cursor-pointer",
                  reel.videoBg
                )}
              >
                {/* Animated grid overlay to look like a live video stream */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.85))] pointer-events-none" />
                <div className="absolute inset-0 bg-white/[0.01] bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
                
                {/* Glowing floating shapes representing video content */}
                <div className="absolute top-[20%] right-[10%] h-[150px] w-[150px] bg-cyan-500/10 blur-[80px] animate-pulse rounded-full pointer-events-none" />
                <div className="absolute bottom-[30%] left-[10%] h-[200px] w-[200px] bg-purple-500/10 blur-[100px] animate-pulse rounded-full pointer-events-none" />

                {/* Big pulsing Play Icon when paused */}
                {isPaused && (
                  <div className="h-20 w-20 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20 scale-105 transition-all">
                    <Play size={32} className="text-white fill-white ml-1" />
                  </div>
                )}
              </div>

              {/* ── REEL MAIN INTERACTIVE OVERLAY ── */}
              <div className="w-full max-w-md mx-auto flex flex-col justify-end relative">
                
                {/* Right side floating action buttons */}
                <div className="absolute right-0 bottom-24 flex flex-col items-center gap-6 z-20">
                  {/* Tutor Profile Avatar with Plus button */}
                  <div className="relative group cursor-pointer active:scale-95 transition-all">
                    <Avatar className="h-12 w-12 border-2 border-white rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                      <AvatarImage src={reel.avatar} />
                      <AvatarFallback className="bg-purple-950 text-white font-bold">U</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-5 w-5 bg-cyan-400 text-black border-2 border-black rounded-full flex items-center justify-center">
                      <UserPlus size={10} strokeWidth={3.5} />
                    </div>
                  </div>

                  {/* Like Action */}
                  <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => handleLike(index)}>
                    <div className={cn(
                      "h-12 w-12 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90",
                      reel.liked ? "bg-red-500/20 text-red-500 border border-red-500/40" : "bg-black/40 text-white border border-white/10 backdrop-blur-md"
                    )}>
                      <Heart size={22} className={cn("transition-colors", reel.liked && "fill-red-500")} />
                    </div>
                    <span className="text-[11px] font-bold text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                      {formatLikes(reel.likes)}
                    </span>
                  </div>

                  {/* Comments Action */}
                  <div className="flex flex-col items-center gap-1 cursor-pointer active:scale-90 transition-all">
                    <div className="h-12 w-12 rounded-full bg-black/40 text-white border border-white/10 backdrop-blur-md flex items-center justify-center shadow-lg">
                      <MessageSquare size={22} />
                    </div>
                    <span className="text-[11px] font-bold text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                      {reel.comments}
                    </span>
                  </div>

                  {/* Share Action */}
                  <div className="flex flex-col items-center gap-1 cursor-pointer active:scale-90 transition-all">
                    <div className="h-12 w-12 rounded-full bg-black/40 text-white border border-white/10 backdrop-blur-md flex items-center justify-center shadow-lg">
                      <Share2 size={22} />
                    </div>
                    <span className="text-[11px] font-bold text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                      {reel.shares}
                    </span>
                  </div>
                </div>

                {/* Bottom Left description panel */}
                <div className="max-w-[270px] space-y-3 z-10 text-left">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                      @{reel.username}
                    </h3>
                    <p className="text-sm text-white/90 leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] font-medium">
                      {reel.caption}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-white/60 text-xs drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] font-semibold uppercase tracking-wider">
                    <Eye size={14} className="text-cyan-400" />
                    <span>{reel.views}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
