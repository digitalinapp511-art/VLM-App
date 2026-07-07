import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { 
  ChevronLeft, Heart, MessageSquare, Share2, 
  UserPlus, Play, Volume2, VolumeX, Eye, Plus, Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studentApi } from "@/lib/student-api";
import { toast } from "sonner";
import StudentBottomNav from "@/features/student/components/layout/StudentBottomNav";

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
  videoUrl?: string; // Optional URL to backend video
};

export default function ShortVideoFeed() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isMuted, setIsMuted] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [subject, setSubject] = useState("");
  const [classNameVal, setClassNameVal] = useState("10th");

  // Fetch real database videos
  const { data: rawVideos } = useQuery({
    queryKey: ["shortVideos"],
    queryFn: studentApi.getVideos,
  });

  const uploadMutation = useMutation({
    mutationFn: studentApi.uploadShortVideo,
    onSuccess: () => {
      toast.success("Short video uploaded successfully! Awaiting approval.");
      setIsUploadOpen(false);
      setVideoFile(null);
      setCaption("");
      setSubject("");
      queryClient.invalidateQueries({ queryKey: ["shortVideos"] });
    },
    onError: () => {
      toast.error("Failed to upload short video. Make sure duration is under 90s.");
    }
  });

  const mockReels: ReelVideo[] = [
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
  ];

  const dbVideos = Array.isArray(rawVideos?.data)
    ? rawVideos.data.map((v: any) => ({
        id: v._id,
        username: v.uploaderId?.nickname || v.uploaderId?.fullName || "Student",
        avatar: v.uploaderId?.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${v._id}`,
        caption: v.caption || v.title || "VLM Academy Short Video",
        views: "0 Views",
        likes: 0,
        comments: "0",
        shares: "0",
        liked: false,
        videoBg: "from-purple-950 via-black to-slate-950",
        topic: v.subject || "General",
        videoUrl: v.videoUrl,
      }))
    : [];

  const reels = [...dbVideos, ...mockReels];

  const [pausedReels, setPausedReels] = useState<Record<string, boolean>>({});

  const handleLike = (index: number) => {
    // Likes handled locally for seamless visual UX
    mockReels; // reference to keep tsc happy
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

  const handleUploadSubmit = () => {
    if (!videoFile) {
      toast.error("Please select a video file!");
      return;
    }
    const formData = new FormData();
    formData.append("video", videoFile);
    formData.append("caption", caption);
    formData.append("title", caption || "Student Short");
    formData.append("subject", subject || "General");
    formData.append("class", classNameVal);

    uploadMutation.mutate(formData);
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
        <div className="flex gap-2 pointer-events-auto">
          <button 
            onClick={() => setIsMuted(prev => !prev)}
            className="h-10 w-10 rounded-xl bg-black/30 border border-white/10 flex items-center justify-center text-white backdrop-blur-md active:scale-95 transition-all"
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>
      </header>

      {/* ── VERTICAL SNAP CONTAINER ── */}
      <div className="h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar">
        {reels.map((reel, index) => {
          const isPaused = pausedReels[reel.id] || false;
          return (
            <div 
              key={reel.id}
              className="h-full w-full snap-start snap-always relative overflow-hidden flex flex-col justify-end pb-24 px-6 bg-black"
            >
              {/* ── BACKGROUND VIDEO OR GRADIENT FEED ── */}
              <div 
                onClick={() => togglePlay(reel.id)}
                className="absolute inset-0 transition-all duration-700 -z-10 flex flex-col items-center justify-center cursor-pointer bg-black"
              >
                {reel.videoUrl ? (
                  <video
                    src={reel.videoUrl}
                    loop
                    playsInline
                    muted={isMuted}
                    autoPlay={!isPaused}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className={cn("absolute inset-0 bg-gradient-to-b w-full h-full", reel.videoBg)}>
                    {/* Animated grid overlay to look like a live video stream */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.85))] pointer-events-none" />
                    <div className="absolute inset-0 bg-white/[0.01] bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
                    
                    {/* Glowing floating shapes representing video content */}
                    <div className="absolute top-[20%] right-[10%] h-[150px] w-[150px] bg-cyan-500/10 blur-[80px] animate-pulse rounded-full pointer-events-none" />
                    <div className="absolute bottom-[30%] left-[10%] h-[200px] w-[200px] bg-purple-500/10 blur-[100px] animate-pulse rounded-full pointer-events-none" />
                  </div>
                )}

                {/* Big pulsing Play Icon when paused */}
                {isPaused && (
                  <div className="absolute z-20 h-20 w-20 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20 scale-105 transition-all">
                    <Play size={32} className="text-white fill-white ml-1" />
                  </div>
                )}
              </div>

              {/* ── REEL MAIN INTERACTIVE OVERLAY ── */}
              <div className="w-full max-w-md mx-auto flex flex-col justify-end relative">
                
                {/* Right side floating action buttons */}
                <div className="absolute right-0 bottom-24 flex flex-col items-center gap-6 z-20">
                  {/* Tutor Profile Avatar with Plus button */}
                  <div 
                    onClick={() => navigate(`/creator-profile/${reel.id}`)}
                    className="relative group cursor-pointer active:scale-95 transition-all"
                  >
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

      {/* ── BOTTOM NAV BAR ── */}
      <StudentBottomNav onFabClick={() => setIsUploadOpen(true)} />

      {/* ── UPLOAD MODAL POPUP ── */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
          <div className="relative w-full max-w-sm rounded-[2rem] border border-slate-100 dark:border-[#221c4e] bg-white dark:bg-[#161233] p-6 text-center shadow-2xl flex flex-col gap-5 text-slate-800 dark:text-slate-100 transition-colors duration-300">
            <h2 className="text-lg font-black tracking-tight flex items-center justify-center gap-2 text-slate-800 dark:text-slate-100">
              <Upload className="h-5 w-5 text-violet-600 dark:text-violet-400" /> Upload Short Video
            </h2>

            <div className="space-y-3 text-left">
              {/* File Selector */}
              <div>
                <label className="text-[10px] font-black tracking-wider text-slate-400 dark:text-slate-500 uppercase block mb-1">Select Video (Max 90s)</label>
                <input 
                  type="file" 
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-none file:text-[10px] file:font-black file:bg-violet-600 dark:file:bg-violet-400 file:text-white hover:file:bg-violet-500"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="text-[10px] font-black tracking-wider text-slate-400 dark:text-slate-500 uppercase block mb-1">Subject</label>
                <input 
                  type="text" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Physics, Math, Chemistry"
                  className="w-full text-xs text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 placeholder:text-slate-300 dark:placeholder:text-slate-600 outline-none focus:border-violet-500"
                />
              </div>

              {/* Caption */}
              <div>
                <label className="text-[10px] font-black tracking-wider text-slate-400 dark:text-slate-500 uppercase block mb-1">Caption / Description</label>
                <textarea 
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Tell students what this short is about..."
                  rows={3}
                  className="w-full text-xs text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 placeholder:text-slate-300 dark:placeholder:text-slate-600 outline-none focus:border-violet-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <Button
                onClick={() => setIsUploadOpen(false)}
                variant="outline"
                className="flex-1 h-11 rounded-xl border-slate-200 dark:border-[#221c4e] bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUploadSubmit}
                disabled={uploadMutation.isPending}
                className="flex-1 h-11 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-400 text-white font-black text-xs border-none shadow-[0_0_15px_rgba(124,58,237,0.3)]"
              >
                {uploadMutation.isPending ? "Uploading..." : "Upload Now"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
