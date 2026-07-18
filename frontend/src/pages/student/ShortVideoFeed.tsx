import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { 
  ChevronLeft, Heart, MessageSquare, Share2, 
  UserPlus, UserMinus, Play, Volume2, VolumeX, Eye, Upload, X, Send, Trash2, UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studentApi } from "@/lib/student-api";
import { useStudentProfile } from "@/hooks/use-student";
import { toast } from "sonner";
import StudentBottomNav from "@/features/student/components/layout/StudentBottomNav";

type Comment = {
  _id: string;
  text: string;
  createdAt: string;
  user: {
    userId: string;
    name: string;
    nickname: string;
    photo: string;
    role: string;
  };
};

interface VideoPlayerProps {
  src: string;
  isActive: boolean;
  isMuted: boolean;
  isPaused: boolean;
}

function VideoPlayer({ src, isActive, isMuted, isPaused }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = isMuted;

    if (isActive && !isPaused) {
      video.play().catch((err) => console.log("Play call interrupted:", err));
    } else {
      video.pause();
    }
  }, [isActive, isPaused, isMuted, src]);

  return (
    <video
      ref={videoRef}
      src={src}
      loop
      playsInline
      muted={isMuted}
      className="absolute inset-0 w-full h-full object-contain"
    />
  );
}

function DescriptionText({ text }: { text: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLongText = text.length > 70;

  return (
    <div className="text-xs text-white/80 leading-normal drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.5)] font-medium text-left">
      <span className={cn(!isExpanded && isLongText && "line-clamp-2")}>
        {text}
      </span>
      {isLongText && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-white font-black underline ml-1 cursor-pointer bg-transparent border-none p-0 inline text-xs"
        >
          {isExpanded ? "Less" : "...more"}
        </button>
      )}
    </div>
  );
}

export default function ShortVideoFeed() {
  const navigate = useNavigate();
  const { id: sharedShortId } = useParams();
  const queryClient = useQueryClient();
  
  const [isMuted, setIsMuted] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [title, setTitle] = useState("");
  const [classNameVal, setClassNameVal] = useState("10");

  // Active Video Tracking
  const [activeReelId, setActiveReelId] = useState<string | null>(null);

  // Interaction Dialog States
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

  const [activeProfileUserId, setActiveProfileUserId] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Public Profile Username Gate Modal States
  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailability, setUsernameAvailability] = useState<{
    available: boolean;
    message: string;
  } | null>(null);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const isAnyDialogOpen = isUploadOpen || isUsernameModalOpen || isCommentsOpen || isProfileOpen;

  // Touch Swipe States
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  // Get current logged-in user profile
  const { data: currentProfileResponse } = useStudentProfile();
  const currentUser = (currentProfileResponse as any)?.data ?? currentProfileResponse;
  const currentUserId = currentUser?.userId?._id || currentUser?.userId;
  const hasUsername = !!currentUser?.userId?.username;

  // Fetch real database videos
  const { data: rawVideos, isLoading: isVideosLoading } = useQuery({
    queryKey: ["shortVideos"],
    queryFn: studentApi.getVideos,
  });

  // Track viewed videos to avoid duplicate increments in the same session
  const viewedVideosRef = useRef<Set<string>>(new Set());

  // Debounced live availability check for username
  useEffect(() => {
    const rawVal = usernameInput.replace(/^@/, '').toLowerCase().trim();
    if (!rawVal) {
      setUsernameAvailability(null);
      return;
    }

    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    if (!alphanumericRegex.test(rawVal)) {
      setUsernameAvailability({
        available: false,
        message: "Only alphanumeric characters (letters/numbers, no spaces or special symbols) are allowed."
      });
      return;
    }

    setIsCheckingUsername(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await studentApi.checkUsernameAvailability(rawVal);
        setUsernameAvailability({
          available: res.available,
          message: res.message
        });
      } catch (err) {
        setUsernameAvailability({
          available: false,
          message: "Error checking username availability."
        });
      } finally {
        setIsCheckingUsername(false);
      }
    }, 450);

    return () => clearTimeout(delayDebounce);
  }, [usernameInput]);

  // Mutations
  const createUsernameMutation = useMutation({
    mutationFn: studentApi.createPublicProfileUsername,
    onSuccess: (data: any) => {
      toast.success(`Public profile username "${data.username}" created successfully!`);
      setIsUsernameModalOpen(false);
      setUsernameInput("");
      
      // Refresh current student profile
      queryClient.invalidateQueries({ queryKey: ["studentProfile"] });
      
      // Trigger user action that was blocked
      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      }
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to create username.");
    }
  });

  const uploadMutation = useMutation({
    mutationFn: studentApi.uploadShortVideo,
    onSuccess: () => {
      toast.success("Short video uploaded successfully! Awaiting approval.");
      setIsUploadOpen(false);
      setVideoFile(null);
      setCaption("");
      setTitle("");
      queryClient.invalidateQueries({ queryKey: ["shortVideos"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to upload video. Make sure duration is under 90s.");
    }
  });

  const likeMutation = useMutation({
    mutationFn: studentApi.likeVideo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shortVideos"] });
    },
    onError: () => {
      toast.error("Failed to update like status.");
    }
  });

  const shareMutation = useMutation({
    mutationFn: studentApi.shareVideo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shortVideos"] });
      toast.success("Video shared link copied!");
    }
  });

  const viewMutation = useMutation({
    mutationFn: studentApi.viewVideo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shortVideos"] });
    }
  });

  // Comments Query
  const { data: commentsResponse } = useQuery({
    queryKey: ["videoComments", activeVideoId],
    queryFn: () => studentApi.getVideoComments(activeVideoId!),
    enabled: !!activeVideoId && isCommentsOpen
  });

  const commentsList: Comment[] = commentsResponse?.data || [];

  const addCommentMutation = useMutation({
    mutationFn: studentApi.addVideoComment,
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["videoComments", activeVideoId] });
      queryClient.invalidateQueries({ queryKey: ["shortVideos"] });
    },
    onError: () => {
      toast.error("Failed to add comment.");
    }
  });

  const deleteCommentMutation = useMutation({
    mutationFn: studentApi.deleteVideoComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videoComments", activeVideoId] });
      queryClient.invalidateQueries({ queryKey: ["shortVideos"] });
      toast.success("Comment deleted successfully.");
    },
    onError: () => {
      toast.error("Failed to delete comment.");
    }
  });

  // Creator profile query
  const { data: profileResponse } = useQuery({
    queryKey: ["publicProfile", activeProfileUserId],
    queryFn: () => studentApi.getPublicProfile(activeProfileUserId!),
    enabled: !!activeProfileUserId && isProfileOpen
  });

  const publicProfileData = profileResponse?.data;

  const followMutation = useMutation({
    mutationFn: studentApi.followUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publicProfile", activeProfileUserId] });
      queryClient.invalidateQueries({ queryKey: ["shortVideos"] });
    },
    onError: () => {
      toast.error("Failed to update follow status.");
    }
  });

  // Process and map dynamic videos from database
  const rawReels = Array.isArray(rawVideos?.data)
    ? rawVideos.data.map((v: any) => {
        const uploader = v.uploaderId || {};
        const isLiked = Array.isArray(v.likedBy) && v.likedBy.includes(currentUserId);
        
        return {
          id: v._id,
          username: uploader.username ? `@${uploader.username}` : (uploader.nickname || uploader.fullName || "Creator"),
          avatar: uploader.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${v._id}`,
          caption: v.caption || v.description || v.title || "VLM Academy Short",
          views: `${v.views || 0} Views`,
          likes: v.likes || 0,
          comments: String(v.comments?.length || 0),
          shares: String(v.shares || 0),
          liked: isLiked,
          videoBg: "from-purple-950 via-black to-slate-950",
          topic: v.subject || "General",
          videoUrl: v.videoUrl,
          uploaderId: uploader._id || uploader.userId,
          isFollowing: !!uploader.isFollowing,
        };
      })
    : [];

  const reels = [...rawReels];
  if (sharedShortId) {
    const sharedIdx = reels.findIndex((r) => r.id === sharedShortId);
    if (sharedIdx > -1) {
      const [sharedItem] = reels.splice(sharedIdx, 1);
      reels.unshift(sharedItem);
    }
  }

  const [pausedReels, setPausedReels] = useState<Record<string, boolean>>({});

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchStartY(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent, creatorId: string) => {
    if (touchStartX === null || touchStartY === null) return;

    const diffX = e.changedTouches[0].clientX - touchStartX;
    const diffY = e.changedTouches[0].clientY - touchStartY;

    // Verify horizontal swipe is dominant and exceeds minimum threshold
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 60) {
      if (diffX > 0) {
        // Swiped Left-to-Right (finger moved left to right) -> Open creator profile
        handleProfileClick(creatorId);
      } else {
        // Swiped Right-to-Left (finger moved right to left) -> Open own public profile
        if (!hasUsername) {
          setPendingAction(() => () => {
            setActiveProfileUserId(currentUserId);
            setIsProfileOpen(true);
          });
          setIsUsernameModalOpen(true);
        } else {
          setActiveProfileUserId(currentUserId);
          setIsProfileOpen(true);
        }
      }
    }

    setTouchStartX(null);
    setTouchStartY(null);
  };

  // Helper Gated Handlers
  const handleLike = (id: string) => {
    if (!hasUsername) {
      setPendingAction(() => () => likeMutation.mutate(id));
      setIsUsernameModalOpen(true);
      return;
    }
    likeMutation.mutate(id);
  };

  const handleCommentClick = (id: string) => {
    if (!hasUsername) {
      setPendingAction(() => () => {
        setActiveVideoId(id);
        setIsCommentsOpen(true);
      });
      setIsUsernameModalOpen(true);
      return;
    }
    setActiveVideoId(id);
    setIsCommentsOpen(true);
  };

  const handleProfileClick = (uploaderId: string) => {
    if (!hasUsername) {
      setPendingAction(() => () => {
        setActiveProfileUserId(uploaderId);
        setIsProfileOpen(true);
      });
      setIsUsernameModalOpen(true);
      return;
    }
    setActiveProfileUserId(uploaderId);
    setIsProfileOpen(true);
  };

  const handleFollowClick = (uploaderId: string) => {
    if (!hasUsername) {
      setPendingAction(() => () => followMutation.mutate(uploaderId));
      setIsUsernameModalOpen(true);
      return;
    }
    followMutation.mutate(uploaderId);
  };

  const handleUploadClick = () => {
    if (!hasUsername) {
      setPendingAction(() => () => setIsUploadOpen(true));
      setIsUsernameModalOpen(true);
      return;
    }
    setIsUploadOpen(true);
  };

  const handleShare = (id: string) => {
    const shareLink = `${window.location.origin}/shorts/${id}`;
    navigator.clipboard.writeText(shareLink);
    shareMutation.mutate(id);
  };

  const togglePlay = (id: string) => {
    setPausedReels(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const formatLikes = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count;
  };

  const handleUploadSubmit = () => {
    if (!videoFile) {
      toast.error("Please select a video file!");
      return;
    }
    if (!title.trim()) {
      toast.error("Please enter a title!");
      return;
    }
    const formData = new FormData();
    formData.append("video", videoFile);
    formData.append("title", title.trim());
    formData.append("description", caption.trim());
    formData.append("class", classNameVal);

    uploadMutation.mutate(formData);
  };

  const handleAddCommentSubmit = () => {
    if (!commentText.trim()) return;
    addCommentMutation.mutate({ id: activeVideoId!, text: commentText });
  };

  const handleCreateUsernameSubmit = () => {
    const rawVal = usernameInput.replace(/^@/, '').toLowerCase().trim();
    if (!rawVal) return;
    createUsernameMutation.mutate(rawVal);
  };

  // Viewport visibility checks via IntersectionObserver
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (reels.length === 0) return;
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const videoId = entry.target.getAttribute("data-video-id");
            if (videoId) {
              setActiveReelId(videoId);
              if (!viewedVideosRef.current.has(videoId)) {
                viewedVideosRef.current.add(videoId);
                viewMutation.mutate(videoId);
              }
            }
          }
        });
      },
      { threshold: 0.6 }
    );

    const videoElements = document.querySelectorAll("[data-video-id]");
    videoElements.forEach((el) => observerRef.current?.observe(el));

    return () => {
      observerRef.current?.disconnect();
    };
  }, [reels.length]);

  // Automatically auto-play any newly visible short video by default
  useEffect(() => {
    if (!activeReelId) return;
    setPausedReels(prev => ({
      ...prev,
      [activeReelId]: false
    }));
  }, [activeReelId]);

  // Silently update the browser URL to /shorts/:id as user scrolls — no re-render
  useEffect(() => {
    if (!activeReelId) return;
    window.history.replaceState(null, '', `/shorts/${activeReelId}`);
  }, [activeReelId]);

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
        {reels.length > 0 && (
          <div className="flex gap-2 pointer-events-auto">
            <button 
              onClick={() => setIsMuted(prev => !prev)}
              className="h-10 w-10 rounded-xl bg-black/30 border border-white/10 flex items-center justify-center text-white backdrop-blur-md active:scale-95 transition-all"
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>
        )}
      </header>

      {/* ── VERTICAL SNAP CONTAINER ── */}
      <div className="h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar">
        {isVideosLoading ? (
          <div className="h-full w-full flex flex-col items-center justify-center gap-3">
            <div className="h-8 w-8 rounded-full border-4 border-violet-600 border-t-transparent animate-spin" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Loading Shorts...</p>
          </div>
        ) : reels.length === 0 ? (
          <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center gap-6">
            <div className="text-6xl">🎬</div>
            <div className="space-y-1">
              <h3 className="text-lg font-black">No Shorts Uploaded Yet</h3>
              <p className="text-xs text-slate-400 max-w-xs">Be the first to upload an educational short video and share your knowledge!</p>
            </div>
            <Button
              onClick={handleUploadClick}
              className="bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white font-black rounded-full px-6 py-3 border-none cursor-pointer"
            >
              Upload First Short
            </Button>
          </div>
        ) : (
          reels.map((reel: any) => {
            const isPaused = pausedReels[reel.id] || false;
            return (
              <div 
                key={reel.id}
                data-video-id={reel.id}
                onTouchStart={handleTouchStart}
                onTouchEnd={(e) => handleTouchEnd(e, reel.uploaderId)}
                className="h-full w-full snap-start snap-always relative overflow-hidden flex flex-col justify-end pb-24 px-6 bg-black"
              >
                {/* ── BACKGROUND VIDEO ── */}
                <div 
                  onClick={() => togglePlay(reel.id)}
                  className="absolute inset-0 transition-all duration-700 z-0 flex flex-col items-center justify-center cursor-pointer bg-black"
                >
                  {reel.videoUrl ? (
                    <VideoPlayer
                      src={reel.videoUrl}
                      isActive={activeReelId === reel.id}
                      isMuted={isMuted}
                      isPaused={isPaused || isAnyDialogOpen}
                    />
                  ) : (
                    <div className={cn("absolute inset-0 bg-gradient-to-b w-full h-full", reel.videoBg)}>
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.85))] pointer-events-none" />
                      <div className="absolute inset-0 bg-white/[0.01] bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
                    </div>
                  )}

                  {/* Big Play Icon overlay */}
                  {isPaused && (
                    <div className="absolute z-20 h-20 w-20 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20 scale-105 transition-all">
                      <Play size={32} className="text-white fill-white ml-1" />
                    </div>
                  )}
                </div>

                {/* ── INTERACTIVE OVERLAY ── */}
                <div className="w-full max-w-md mx-auto flex flex-col justify-end relative z-10">
                  
                  {/* Right side widgets */}
                  <div className="absolute right-0 bottom-24 flex flex-col items-center gap-6 z-20">
                    
                    {/* Like Trigger */}
                    <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => handleLike(reel.id)}>
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

                    {/* Comments Trigger */}
                    <div 
                      onClick={() => handleCommentClick(reel.id)}
                      className="flex flex-col items-center gap-1 cursor-pointer active:scale-90 transition-all"
                    >
                      <div className="h-12 w-12 rounded-full bg-black/40 text-white border border-white/10 backdrop-blur-md flex items-center justify-center shadow-lg">
                        <MessageSquare size={22} />
                      </div>
                      <span className="text-[11px] font-bold text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                        {reel.comments}
                      </span>
                    </div>

                    {/* Share Trigger */}
                    <div className="flex flex-col items-center gap-1 cursor-pointer active:scale-90 transition-all" onClick={() => handleShare(reel.id)}>
                      <div className="h-12 w-12 rounded-full bg-black/40 text-white border border-white/10 backdrop-blur-md flex items-center justify-center shadow-lg">
                        <Share2 size={22} />
                      </div>
                      <span className="text-[11px] font-bold text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                        {reel.shares}
                      </span>
                    </div>
                  </div>

                  {/* Left descriptors */}
                  <div className="max-w-[270px] space-y-3 z-10 text-left">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 
                          onClick={() => handleProfileClick(reel.uploaderId)}
                          className="text-base font-bold text-white tracking-wide flex items-center gap-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] cursor-pointer hover:underline"
                        >
                          {reel.username}
                        </h3>
                        {reel.uploaderId !== currentUserId && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFollowClick(reel.uploaderId);
                            }}
                            className={cn(
                              "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-white/20 active:scale-95 transition-all shadow-md cursor-pointer",
                              reel.isFollowing 
                                ? "bg-white/20 text-white" 
                                : "bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white border-none shadow-[0_2px_8px_rgba(124,58,237,0.4)]"
                            )}
                          >
                            {reel.isFollowing ? "Following" : "Follow"}
                          </button>
                        )}
                      </div>
                      
                      {/* Title */}
                      {reel.title && (
                        <h4 className="text-sm font-black text-white/95 drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.5)]">
                          {reel.title}
                        </h4>
                      )}

                      {/* Description / Caption with Read More */}
                      {reel.caption && (
                        <DescriptionText text={reel.caption} />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-white/60 text-xs drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] font-semibold uppercase tracking-wider">
                      <Eye size={14} className="text-cyan-400" />
                      <span>{reel.views}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── BOTTOM NAV BAR ── */}
      <StudentBottomNav onFabClick={handleUploadClick} />

      {/* ── USERNAME REGISTRATION MODAL GATED GATEWAY ── */}
      {isUsernameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-6">
          <div className="relative w-full max-w-sm rounded-[2.5rem] border border-slate-100 dark:border-[#221c4e] bg-white dark:bg-[#161233] p-6 text-center shadow-2xl flex flex-col gap-5 text-slate-800 dark:text-slate-100">
            <button 
              onClick={() => {
                setIsUsernameModalOpen(false);
                setPendingAction(null);
                setUsernameInput("");
              }}
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-slate-50 dark:bg-slate-900 border-none flex items-center justify-center text-slate-500 hover:bg-slate-150 cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="mx-auto h-12 w-12 rounded-full bg-violet-100 dark:bg-violet-950 flex items-center justify-center text-violet-600 dark:text-violet-400">
              <UserCheck size={24} />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-black tracking-tight">Create Public Profile</h2>
              <p className="text-xs text-slate-400 font-bold max-w-xs mx-auto">
                Select a unique public username to interact, upload, like, comment, and follow creators.
              </p>
            </div>

            <div className="space-y-2.5 text-left">
              <div>
                <label className="text-[10px] font-black tracking-wider text-slate-400 dark:text-slate-550 uppercase block mb-1">Username</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">@</span>
                  <input 
                    type="text" 
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="learner99"
                    className="w-full text-xs text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full py-3 pl-8 pr-5 placeholder:text-slate-350 outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              {/* Live Availability Status */}
              {usernameInput && (
                <div className="text-[10px] font-black tracking-wide pl-1">
                  {isCheckingUsername ? (
                    <span className="text-slate-400">Checking availability...</span>
                  ) : usernameAvailability ? (
                    <span className={usernameAvailability.available ? "text-emerald-500" : "text-red-500"}>
                      {usernameAvailability.message}
                    </span>
                  ) : null}
                </div>
              )}
            </div>

            <Button
              onClick={handleCreateUsernameSubmit}
              disabled={
                !usernameAvailability?.available || 
                isCheckingUsername || 
                createUsernameMutation.isPending
              }
              className="w-full h-11 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-400 text-white font-black text-xs uppercase tracking-wider border-none shadow-[0_4px_15px_rgba(124,58,237,0.3)] disabled:opacity-50"
            >
              {createUsernameMutation.isPending ? "Creating Profile..." : "Create Profile"}
            </Button>
          </div>
        </div>
      )}

      {/* ── COMMENTS MODAL ── */}
      {isCommentsOpen && activeVideoId && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-0">
          <div className="relative w-full max-w-md h-[70vh] rounded-t-[2.5rem] bg-white dark:bg-[#161233] p-6 shadow-2xl flex flex-col justify-between text-slate-800 dark:text-slate-100 transition-colors duration-300">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-black tracking-widest uppercase">Comments ({commentsList.length})</h3>
              <button 
                onClick={() => {
                  setIsCommentsOpen(false);
                  setActiveVideoId(null);
                }} 
                className="h-8 w-8 rounded-full bg-slate-50 dark:bg-slate-900 border-none flex items-center justify-center cursor-pointer text-slate-500 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 no-scrollbar">
              {commentsList.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 gap-2">
                  <p className="text-sm font-bold">No comments yet</p>
                  <p className="text-xs">Be the first to share your thoughts!</p>
                </div>
              ) : (
                commentsList.map((c) => {
                  const isOwnComment = c.user?.userId === currentUserId;
                  return (
                    <div key={c._id} className="flex gap-3 items-start group">
                      <Avatar className="h-8 w-8 border border-slate-100 shrink-0">
                        <AvatarImage src={c.user?.photo} />
                        <AvatarFallback className="bg-purple-950 text-white text-[10px] font-black">U</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs font-black text-slate-800 dark:text-slate-100">{c.user?.nickname || c.user?.name}</span>
                          <span className="text-[9px] text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-slate-650 dark:text-slate-300 leading-normal text-left">{c.text}</p>
                      </div>
                      {isOwnComment && (
                        <button
                          onClick={() => deleteCommentMutation.mutate({ id: activeVideoId, commentId: c._id })}
                          className="text-red-500/60 hover:text-red-500 border-none bg-transparent cursor-pointer p-1 rounded transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Bar */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-3">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCommentSubmit()}
                placeholder="Add a public comment..."
                className="flex-1 text-xs text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full py-3 px-5 placeholder:text-slate-350 outline-none focus:border-violet-500"
              />
              <button
                onClick={handleAddCommentSubmit}
                disabled={!commentText.trim() || addCommentMutation.isPending}
                className="h-10 w-10 rounded-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white flex items-center justify-center border-none cursor-pointer shrink-0 active:scale-95 transition-all shadow-md"
              >
                <Send size={16} className="ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PUBLIC CREATOR PROFILE FULL PAGE ── */}
      {isProfileOpen && activeProfileUserId && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-[#110e24] text-slate-800 dark:text-slate-100 transition-colors duration-300">
          
          {/* Header */}
          <header className="flex w-full items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 shrink-0 bg-white dark:bg-[#110e24]">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-10 w-10 rounded-xl border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-white active:scale-95 transition-all" 
              onClick={() => {
                setIsProfileOpen(false);
                setActiveProfileUserId(null);
              }}
            >
              <ChevronLeft size={20} />
            </Button>
            <span className="text-sm font-black tracking-widest uppercase text-slate-800 dark:text-white">
              Public Profile
            </span>
            <div className="w-10 h-10" />
          </header>

          {/* Profile Loading / Body */}
          {!publicProfileData ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="h-8 w-8 rounded-full border-4 border-violet-600 border-t-transparent animate-spin" />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar pb-10">
              
              <div className="flex flex-col items-center text-center gap-5">
                {/* Avatar */}
                <Avatar className="h-24 w-24 border-4 border-violet-600 shadow-md">
                  <AvatarImage src={publicProfileData.profilePhoto} />
                  <AvatarFallback className="bg-purple-950 text-white font-black text-3xl">U</AvatarFallback>
                </Avatar>

                {/* Info */}
                <div className="space-y-1">
                  <h2 className="text-xl font-black leading-tight text-slate-900 dark:text-white text-center">
                    {publicProfileData.nickname || publicProfileData.fullName}
                  </h2>
                  <div className="flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-wider font-black text-slate-450 dark:text-slate-500">
                    <span className="bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-md">{publicProfileData.role}</span>
                    {publicProfileData.class && <span className="bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-md">Class {publicProfileData.class}</span>}
                  </div>
                </div>

                {/* Bio */}
                {publicProfileData.bio && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 italic max-w-xs leading-relaxed font-medium">
                    "{publicProfileData.bio}"
                  </p>
                )}

                {/* Follow & Stats strip */}
                <div className="w-full flex items-center justify-around py-4 px-4 bg-slate-50 dark:bg-slate-900/60 rounded-3xl text-center shadow-inner">
                  <div>
                    <p className="text-base font-black leading-none text-slate-900 dark:text-white">{publicProfileData.followersCount || 0}</p>
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-505 uppercase mt-1.5 leading-none">Followers</p>
                  </div>
                  <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
                  <div>
                    <p className="text-base font-black leading-none text-slate-900 dark:text-white">{publicProfileData.followingCount || 0}</p>
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-505 uppercase mt-1.5 leading-none">Following</p>
                  </div>
                  <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
                  <div>
                    <p className="text-base font-black leading-none text-slate-900 dark:text-white">{publicProfileData.totalViews || 0}</p>
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-505 uppercase mt-1.5 leading-none">Total Views</p>
                  </div>
                </div>

                {/* Follow Button */}
                {activeProfileUserId !== currentUserId && (
                  <Button
                    onClick={() => followMutation.mutate(activeProfileUserId!)}
                    disabled={followMutation.isPending}
                    className={cn(
                      "w-full h-12 rounded-full font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md border-none cursor-pointer",
                      publicProfileData.isFollowing
                        ? "bg-slate-250 dark:bg-slate-900 hover:bg-slate-350 dark:hover:bg-slate-850 text-slate-850 dark:text-white"
                        : "bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-400 text-white shadow-[0_4px_15px_rgba(124,58,237,0.3)]"
                    )}
                  >
                    {publicProfileData.isFollowing ? (
                      <>
                        <UserMinus size={14} /> Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlus size={14} /> Follow
                      </>
                    )}
                  </Button>
                )}

                {/* Creators Uploads List */}
                <div className="w-full text-left space-y-3.5 pt-4">
                  <h4 className="text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase">
                    Approved Shorts ({publicProfileData.videos?.length || 0})
                  </h4>
                  {publicProfileData.videos?.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center italic py-4">No videos approved yet.</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      {publicProfileData.videos.map((vid: any) => (
                        <div 
                          key={vid.videoId} 
                          onClick={() => {
                            setIsProfileOpen(false);
                            setActiveProfileUserId(null);
                            const el = document.querySelector(`[data-video-id='${vid.videoId}']`);
                            el?.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="relative aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer group bg-black border border-slate-100 dark:border-slate-850 shadow-sm"
                        >
                          {vid.thumbnailUrl ? (
                            <img src={vid.thumbnailUrl} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-tr from-purple-950 to-slate-900 flex items-center justify-center text-[10px] text-white/50 uppercase font-black tracking-tighter">Short</div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Play size={18} className="text-white fill-white" />
                          </div>
                          <div className="absolute bottom-2 left-2 flex items-center gap-1 text-[9px] font-black text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                            <Eye size={10} /> {vid.views || 0}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}
        </div>
      )}

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
                <label className="text-[10px] font-black tracking-wider text-slate-400 dark:text-slate-550 uppercase block mb-1">Select Video (Max 90s)</label>
                <input 
                  type="file" 
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-none file:text-[10px] file:font-black file:bg-violet-600 dark:file:bg-violet-400 file:text-white hover:file:bg-violet-500"
                />
              </div>

              {/* Title */}
              <div>
                <label className="text-[10px] font-black tracking-wider text-slate-400 dark:text-slate-555 uppercase block mb-1">Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Newton's Third Law Explained"
                  className="w-full text-xs text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 placeholder:text-slate-350 dark:placeholder:text-slate-600 outline-none focus:border-violet-500"
                />
              </div>

              {/* Caption */}
              <div>
                <label className="text-[10px] font-black tracking-wider text-slate-400 dark:text-slate-555 uppercase block mb-1">Caption / Description</label>
                <textarea 
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Tell students what this short is about..."
                  rows={3}
                  className="w-full text-xs text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 placeholder:text-slate-350 dark:placeholder:text-slate-600 outline-none focus:border-violet-500 resize-none"
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
