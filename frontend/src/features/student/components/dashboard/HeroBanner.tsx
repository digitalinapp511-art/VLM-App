import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PATHS } from "@/routes/paths";
import { Flame, Star, Shield, TrendingUp } from "lucide-react";
import { studentApi } from "@/lib/student-api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface HeroBannerProps {
  nickname: string;
  streak: number;
  totalPoints: number;
  mcqPoints?: number;
  level: string;
}

export default function HeroBanner({
  nickname,
  streak,
  totalPoints,
  mcqPoints = 0,
  level,
}: HeroBannerProps) {
  const navigate = useNavigate();
  const [slideIndex, setSlideIndex] = useState(0);

  // Touch Swipe States
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  // Fetch active banners from backend
  const { data: bannersResponse } = useQuery({
    queryKey: ["activeBanners"],
    queryFn: () => studentApi.getActiveBanners(),
  });

  const banners = bannersResponse?.data || [];

  const defaultBanners = [
    { tag: 'NEW', title: 'Master Your Concepts', highlightWord: 'Concepts', description: 'Explore new courses, practice daily and achieve your goals!', buttonText: 'Explore Now', buttonLink: '/library', imageUrl: '/onboarding1.png' },
    { tag: '24/7 AI', title: 'Meet Your AI Tutor', highlightWord: 'Tutor', description: 'Ask doubts anytime, get step-by-step math solver help!', buttonText: 'Chat Now', buttonLink: '/ai-chat', imageUrl: '/onboarding2.png' },
    { tag: 'XP BONUS', title: 'Daily MCQ Streak', highlightWord: 'Streak', description: 'Complete 20 daily questions and earn double XP multiplier!', buttonText: 'Start Now', buttonLink: '/mcq', imageUrl: '/onboarding3.png' },
    { tag: 'CASHBACK', title: 'Get 50% Cashback on Recharge', highlightWord: '50%', description: 'Recharge your VLM Wallet today and get an instant 50% bonus points cashback!', buttonText: 'Recharge Now', buttonLink: '/wallet', imageUrl: '/onboarding4.png' }
  ];

  const activeBanners = banners.length > 0 ? banners : defaultBanners;

  // Auto-play interval to cycle through slides every 6 seconds
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % activeBanners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeBanners.length]);

  const currentBanner = activeBanners[slideIndex] || defaultBanners[0];

  const renderTitle = (title: string, highlight?: string, isCoupon?: boolean) => {
    if (!highlight) return title;
    const parts = title.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, i) => {
      const isMatch = part.toLowerCase() === highlight.toLowerCase();
      if (isMatch) {
        if (isCoupon) {
          return (
            <span 
              key={i} 
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(part);
                toast.success(`Coupon Code "${part}" copied to clipboard!`);
              }}
              className="text-yellow-400 cursor-pointer underline decoration-dashed underline-offset-4 hover:text-yellow-300 transition-colors"
              title="Click to copy coupon code"
            >
              {part}
            </span>
          );
        } else {
          return (
            <span key={i} className="text-yellow-400 font-black">
              {part}
            </span>
          );
        }
      }
      return part;
    });
  };

  const handleActionClick = () => {
    if (currentBanner.isCoupon && currentBanner.highlightWord) {
      navigator.clipboard.writeText(currentBanner.highlightWord);
      toast.success(`Coupon Code "${currentBanner.highlightWord}" copied to clipboard!`);
    }
    const link = currentBanner.buttonLink || '/library';
    if (link.startsWith('http')) {
      window.open(link, '_blank');
    } else {
      navigate(link);
    }
  };

  // Swipe Action Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setSlideIndex((prev) => (prev + 1) % activeBanners.length);
    } else if (isRightSwipe) {
      setSlideIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* ── 1. GREETING HEADER ── */}
      <div className="text-left mt-2 px-1">
        <h2 className="text-2xl font-black text-slate-800 dark:text-white leading-tight flex items-center gap-1.5">
          Hello, {nickname}! <span className="animate-bounce">👋</span>
        </h2>
        <p className="text-xs text-slate-450 dark:text-slate-400 font-bold mt-0.5">
          Let's continue your learning journey!
        </p>
      </div>

      {/* ── 2. FEATURED BANNER CARD ── */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative rounded-[1.8rem] overflow-hidden w-full p-4 sm:p-5 text-left flex flex-col justify-between transition-all duration-500 ease-in-out cursor-grab active:cursor-grabbing"
        style={{
          background: "linear-gradient(135deg, #4f21db 0%, #7e22ce 100%)",
          height: "148px",
        }}
      >
        {/* Background decorative circles */}
        <div className="absolute top-[-30px] right-[-30px] w-40 h-40 rounded-full bg-white/5 blur-xl pointer-events-none" />
        <div className="absolute bottom-[-30px] left-[-30px] w-28 h-28 rounded-full bg-white/5 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between h-full max-w-[62%] gap-2 pb-2">
          {/* Tag / Badge */}
          <div className="bg-yellow-400 text-black text-[8px] font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full w-fit">
            {currentBanner.tag || 'NEW'}
          </div>

          {/* Title */}
          <h3 className="text-sm sm:text-base font-black tracking-tight text-white leading-none mt-1">
            {renderTitle(currentBanner.title, currentBanner.highlightWord, currentBanner.isCoupon)}
          </h3>

          {/* Description */}
          <p className="text-[9px] sm:text-[10px] text-white/80 font-bold leading-tight">
            {currentBanner.description}
          </p>

          {/* Action Button */}
          <button
            onClick={handleActionClick}
            className="flex items-center justify-center gap-1 bg-white hover:bg-slate-50 text-slate-900 font-black text-[9px] uppercase tracking-wider px-4 py-2 rounded-full transition-transform active:scale-95 w-fit border-none cursor-pointer shadow-md mt-1"
          >
            <span>{currentBanner.buttonText || 'Explore Now'}</span>
            <span className="text-[10px]">→</span>
          </button>
        </div>

        {/* Centered Pagination Dots at the bottom middle */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
          {activeBanners.map((_: any, idx: number) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setSlideIndex(idx);
              }}
              className={cn(
                "h-1.5 w-1.5 rounded-full transition-all border-none p-0 cursor-pointer",
                slideIndex === idx ? "bg-white scale-125" : "bg-white/40 hover:bg-white/60"
              )}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* 3D Mascot / Image on the right */}
        <div className="absolute right-2 bottom-0 top-0 w-[35%] flex items-end justify-center select-none pointer-events-none overflow-hidden">
          <img 
            src={currentBanner.imageUrl || '/avatar.png'} 
            alt="Banner Graphic" 
            className="h-[105%] w-auto object-contain object-bottom" 
          />
        </div>
      </div>

      {/* ── 3. STAT COUNTER CARD ROW ── */}
      <div className="bg-white dark:bg-[#161233] border border-slate-200 dark:border-slate-800 rounded-[1.5rem] py-3 px-4 flex flex-row items-center justify-around shadow-sm select-none">
        {/* Day Streak */}
        <div className="flex flex-col items-center flex-1">
          <Flame size={16} className="text-orange-500 fill-orange-500" />
          <span className="text-xs font-black text-slate-800 dark:text-white mt-1 leading-none">{streak}</span>
          <span className="text-[8px] font-bold text-slate-400 dark:text-slate-550 uppercase mt-1 leading-none">Day Streak</span>
        </div>

        {/* Vertical divider */}
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

        {/* Points */}
        <div className="flex flex-col items-center flex-1">
          <Star size={16} className="text-yellow-500 fill-yellow-500" />
          <span className="text-xs font-black text-slate-800 dark:text-white mt-1 leading-none">{totalPoints}</span>
          <span className="text-[8px] font-bold text-slate-400 dark:text-slate-550 uppercase mt-1 leading-none">Points</span>
        </div>

        {/* Vertical divider */}
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

        {/* Level */}
        <div 
          onClick={() => navigate(PATHS.LEADERBOARD)}
          className="flex flex-col items-center flex-1 cursor-pointer active:scale-95 transition-transform"
        >
          <Shield size={16} className="text-violet-500 fill-violet-500/20" />
          <span className="text-xs font-black text-violet-650 dark:text-violet-400 mt-1 leading-none">{level}</span>
          <span className="text-[8px] font-bold text-slate-400 dark:text-slate-550 uppercase mt-1 leading-none">Level</span>
        </div>

        {/* Vertical divider */}
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

        {/* Total XP */}
        <div className="flex flex-col items-center flex-1">
          <TrendingUp size={16} className="text-emerald-500" />
          <span className="text-xs font-black text-slate-800 dark:text-white mt-1 leading-none">{mcqPoints} XP</span>
          <span className="text-[8px] font-bold text-slate-400 dark:text-slate-550 uppercase mt-1 leading-none">Total XP</span>
        </div>
      </div>
    </div>
  );
}
