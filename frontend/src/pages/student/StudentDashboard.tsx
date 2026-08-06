/**
 * StudentDashboard.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Thin orchestration layer — assembles the new VLM Academy-style dashboard.
 *
 * Includes:
 *   - Hamburger Menu (3 lines) on the top left
 *   - Slide-out Sidebar Drawer with:
 *     - Home, My Courses, Live Classes, Rewards, Career Guide, Settings
 *     - "Upgrade to VLM Premium" CTA cards
 *   - VLM Academy Brand Logo in the header
 *
 * Component hierarchy:
 *   StudentDashboard
 *     ├── Sidebar Drawer      (Home, Courses, Classes, Rewards, Career, Settings, Upgrade)
 *     ├── HeroBanner          (greeting + streak/points/level)
 *     ├── LiveSupportBanner   (24x7 teacher support strip)
 *     ├── QuickAccessGrid     (10-tile quick access)
 *     ├── SubjectProgress     (circular gauge + subject bars)
 *     ├── RewardsBanner       (purple trophy banner)
 *     ├── MiniCards           (daily goal / upcoming test / AI tutor)
 *     └── StudentBottomNav    (fixed bottom nav)
 */
import { useState, useEffect } from "react";
import DashboardLoading from "@/components/basic/DashboardLoading";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import {
  Bell, Menu, X, Home as HomeIcon, BookOpen, Tv, Gift, Compass, Settings, Zap, ChevronRight, Wallet
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { studentApi } from "@/lib/student-api";
import { useStudentProfile } from "@/hooks/use-student";

// Feature components
import { useStudentDashboard } from "@/features/student/hooks/use-student-dashboard";
import HeroBanner from "@/features/student/components/dashboard/HeroBanner";
import LiveSupportBanner from "@/features/student/components/dashboard/LiveSupportBanner";
import QuickAccessGrid from "@/features/student/components/dashboard/QuickAccessGrid";
import SubjectProgress from "@/features/student/components/dashboard/SubjectProgress";
import RewardsBanner from "@/features/student/components/dashboard/RewardsBanner";
import FloatingSpinWheel from "@/features/student/components/dashboard/FloatingSpinWheel";
import MiniCards from "@/features/student/components/dashboard/MiniCards";
import StudentBottomNav from "@/features/student/components/layout/StudentBottomNav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import logoImg from "@/assets/logo.png";

import { Sun, Moon, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSettingsPopup, setShowSettingsPopup] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);

  const {
    isLoading,
    nickname,
    photo,
    streak,
    totalPoints,
    mcqPoints,
    level,
    lastSpinDate,
    activeSecondsSinceLastSpin,
    spinCooldownHours,
    mcqCompleted,
    mcqTotal,
    activeTeachersCount,
    unreadNotificationCount,
    pendingParentRequestCount,
    subscription,
    profile: student,
  } = useStudentDashboard();

  const isPremium = subscription.status === "active" || subscription.status === "trial";

  const unreadCount = unreadNotificationCount;

  const [showLockedModal, setShowLockedModal] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (lastSpinDate) {
      const calculateSecondsRemaining = () => {
        const lastSpin = new Date(lastSpinDate).getTime();
        const diffMs = Date.now() - lastSpin;
        const cooldownMs = (spinCooldownHours || 2) * 3600 * 1000;
        const remSeconds = Math.max(0, Math.ceil((cooldownMs - diffMs) / 1000));
        setSecondsLeft(remSeconds);
      };

      calculateSecondsRemaining();
      const interval = setInterval(calculateSecondsRemaining, 1000);
      return () => clearInterval(interval);
    } else {
      setSecondsLeft(0);
    }
  }, [lastSpinDate, spinCooldownHours]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
    const s = (totalSeconds % 60).toString().padStart(2, "0");
    return { h, m, s };
  };
  const { h, m, s } = formatTime(secondsLeft);

  const [appTheme, setAppTheme] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("vlm_student_theme") as "light" | "dark") || "light";
  });

  const [devBypass, setDevBypass] = useState<boolean>(() => {
    const hasToken = !!localStorage.getItem("vlm_token");
    return localStorage.getItem("dev_bypass_auth") === "true" && !hasToken;
  });

  const handleThemeChange = (selectedTheme: "light" | "dark") => {
    setAppTheme(selectedTheme);
    localStorage.setItem("vlm_student_theme", selectedTheme);
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(selectedTheme);
    toast.success(`Theme switched to ${selectedTheme} mode`);
  };

  const handleBypassToggle = (enabled: boolean) => {
    setDevBypass(enabled);
    localStorage.setItem("dev_bypass_auth", enabled ? "true" : "false");
    toast.success(enabled ? "Demo mode enabled" : "Demo mode disabled");
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  if (isLoading) return <DashboardLoading />;

  const menuItems = [
    { label: "Home", icon: <HomeIcon size={20} />, onClick: () => navigate(PATHS.STUDENT_DASHBOARD) },
    { label: "My Courses", icon: <BookOpen size={20} />, onClick: () => navigate(PATHS.LIBRARY) },
    { label: "Live Classes", icon: <Tv size={20} />, onClick: () => navigate(PATHS.LIVE_CLASSES) },
    { label: "Rewards", icon: <Gift size={20} />, onClick: () => navigate(PATHS.SPINNER) },
    { label: "Career Guide", icon: <Compass size={20} />, onClick: () => navigate(PATHS.COMING_SOON) },
    { label: "Settings", icon: <Settings size={20} />, onClick: () => setShowSettingsPopup(true) },
  ];

  return (
    <div className="h-svh w-full flex flex-col bg-[#f4f6ff] dark:bg-[#0b081e] font-sans relative overflow-hidden transition-colors duration-300">
      
      {/* ── Sidebar Menu Drawer ────────────────────────────────────────── */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/40 z-[100] backdrop-blur-sm"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 w-80 bg-white dark:bg-[#110d2c] z-[100] shadow-2xl flex flex-col p-6 border-r border-slate-100 dark:border-slate-800"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <img src={logoImg} alt="VLM Academy" className="h-8 w-auto" />
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-700 active:scale-90 transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Navigation List */}
              <div className="flex-1 py-6 space-y-2 overflow-y-auto">
                {menuItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setIsMenuOpen(false);
                      item.onClick();
                    }}
                    className="flex items-center justify-between w-full p-3 rounded-2xl text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-violet-600">{item.icon}</div>
                      <span className="text-sm font-black tracking-wide">{item.label}</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-400" />
                  </button>
                ))}

                {/* Bottom Premium Upgrade/Manage Banner */}
                <div className="mt-6 bg-gradient-to-br from-violet-600 to-indigo-700 p-5 rounded-3xl text-white relative overflow-hidden shadow-xl shadow-violet-500/20">
                  <div className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full bg-white/10 blur-lg" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-1.5 bg-white/20 w-fit px-2.5 py-1 rounded-full text-[9px] font-black tracking-wider uppercase mb-2">
                      <Zap size={10} className="fill-yellow-400 text-yellow-400" /> {isPremium ? "Active Plan" : "Premium"}
                    </div>
                    <p className="text-sm font-black leading-tight">
                      {isPremium ? "Manage VLM Premium" : "Upgrade to VLM Premium"}
                    </p>
                    <p className="text-[10px] text-white/70 mt-1 leading-snug">
                      {isPremium
                        ? `Premium active until ${subscription.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString() : subscription.trialEndsAt ? new Date(subscription.trialEndsAt).toLocaleDateString() : "next billing cycle"}.`
                        : "Get unlimited live doubts and professional career counseling"}
                    </p>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        if (isPremium) {
                          setShowSubModal(true);
                        } else {
                          navigate(PATHS.PLAN_SCREEN);
                        }
                      }}
                      className="mt-4 w-full bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs py-2.5 rounded-2xl shadow-md transition-all active:scale-95 uppercase tracking-wider"
                    >
                      {isPremium ? "Manage Plan" : "Upgrade Now"}
                    </button>
                  </div>
                </div>

              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Top Header ─────────────────────────────────────────────────── */}
      <header className="w-full max-w-3xl mx-auto flex items-center justify-between px-5 pt-4 pb-3 z-10 shrink-0">
        {/* Left Menu Button + Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="h-10 w-10 rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white active:scale-90 transition-transform"
          >
            <Menu size={20} />
          </button>
          <img src={logoImg} alt="VLM Academy Logo" className="h-14 w-auto object-contain" />
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Wallet Button */}
          <button
            onClick={() => navigate(PATHS.WALLET)}
            className="h-9 w-9 rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Wallet size={18} className="text-violet-600 dark:text-violet-400" />
          </button>

          {/* Notification bell */}
          <button
            onClick={() => navigate(PATHS.STUDENT_NOTIFICATIONS)}
            className="relative h-9 w-9 rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-center"
          >
            <Bell size={18} className="text-slate-600 dark:text-slate-300" />
            {unreadCount > 0 && (
              <>
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full border border-white dark:border-slate-900" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-white text-[8px] font-black flex items-center justify-center">
                  {unreadCount}
                </span>
              </>
            )}
          </button>

          {/* Avatar */}
          <Avatar
            className="h-9 w-9 border-2 border-violet-300 cursor-pointer"
            onClick={() => navigate(PATHS.PROFILE)}
          >
            <AvatarImage src={photo} />
            <AvatarFallback className="bg-violet-100 text-violet-700 font-black text-xs">
              {nickname?.[0]?.toUpperCase() ?? "S"}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <main className="flex-1 w-full max-w-3xl mx-auto overflow-y-auto space-y-4 px-5 pb-28 no-scrollbar">
        {/* 1. Hero Banner */}
        <HeroBanner
          nickname={nickname}
          streak={streak}
          totalPoints={totalPoints}
          mcqPoints={mcqPoints}
          level={level}
        />

        {/* 2. Live Support Strip */}
        <LiveSupportBanner activeTeachersCount={activeTeachersCount} />

        {/* 3. Quick Access Grid */}
        <QuickAccessGrid />

        {/* 4. Subject Progress */}
        <SubjectProgress />

        {/* 5. Rewards Banner */}
         <RewardsBanner lastSpinDate={lastSpinDate} spinCooldownHours={spinCooldownHours} onLockedClick={() => setShowLockedModal(true)} />

        {/* 6. Mini Cards (Daily Goal / Upcoming Test / AI Tutor) */}
        <MiniCards mcqCompleted={mcqCompleted} mcqTotal={mcqTotal} />
      </main>

      {/* ── Fixed Bottom Nav ───────────────────────────────────────────── */}
      <StudentBottomNav />

      {/* Floating Spin Wheel Widget */}
      <FloatingSpinWheel lastSpinDate={lastSpinDate} activeSecondsSinceLastSpin={activeSecondsSinceLastSpin} onLockedClick={() => setShowLockedModal(true)} />

      {/* ── SETTINGS MODAL POPUP ── */}
      <AnimatePresence>
        {showSettingsPopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettingsPopup(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-sm rounded-[32px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#161233] p-6 shadow-2xl text-slate-800 dark:text-slate-100"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
                    <Settings size={18} />
                  </div>
                  <span className="text-sm font-black text-slate-800 dark:text-slate-100">App Settings</span>
                </div>
                <button
                  onClick={() => setShowSettingsPopup(false)}
                  className="h-7 w-7 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-300 hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Settings Content */}
              <div className="py-5 space-y-5">
                {/* 1. App Theme */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-1">App Theme</label>
                  <div className="grid grid-cols-2 gap-2.5 p-1 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => handleThemeChange("light")}
                      className={cn(
                        "py-2 rounded-xl text-xs font-black transition-all active:scale-[0.98]",
                        appTheme === "light"
                          ? "bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 shadow-sm border border-slate-100 dark:border-slate-700"
                          : "text-slate-400 dark:text-slate-300 hover:text-slate-600"
                      )}
                    >
                      ☀️ Light
                    </button>
                    <button
                      type="button"
                      onClick={() => handleThemeChange("dark")}
                      className={cn(
                        "py-2 rounded-xl text-xs font-black transition-all active:scale-[0.98]",
                        appTheme === "dark"
                          ? "bg-violet-600 text-white shadow-sm"
                          : "text-slate-400 dark:text-slate-300 hover:text-slate-600"
                      )}
                    >
                      🌙 Dark
                    </button>
                  </div>
                </div>

                {/* 2. Subscription Details */}
                {isPremium && (
                  <div className="flex flex-col gap-2 text-left pt-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-1">My Subscription</label>
                    {(() => {
                      const classNum = parseInt(String(student?.class || "").replace(/\D/g, ""), 10) || 10;
                      const priceText = subscription.status === "trial" 
                        ? "₹1 (Trial)" 
                        : (classNum >= 11 ? "₹99/month" : classNum >= 9 ? "₹79/month" : "₹59/month");
                      
                      let daysRemaining = 0;
                      if (subscription.expiresAt) {
                        const diffTime = new Date(subscription.expiresAt).getTime() - Date.now();
                        daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
                      } else if (subscription.trialEndsAt) {
                        const diffTime = new Date(subscription.trialEndsAt).getTime() - Date.now();
                        daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
                      }

                      return (
                        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-800 dark:text-white">
                              {subscription.status === "trial" ? "3-Day Free Trial" : "VLM Premium"}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                              Active
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-[10px]">
                            <div>
                              <p className="text-slate-400 font-bold uppercase tracking-wider">Price</p>
                              <p className="font-extrabold text-slate-700 dark:text-white">{priceText}</p>
                            </div>
                            <div>
                              <p className="text-slate-400 font-bold uppercase tracking-wider">Remaining</p>
                              <p className="font-extrabold text-violet-600 dark:text-violet-400">{daysRemaining} days left</p>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => {
                              setShowSettingsPopup(false);
                              navigate(PATHS.PLAN_SCREEN);
                            }}
                            className="w-full h-9 bg-violet-600 hover:bg-violet-500 text-white font-black text-[10px] rounded-xl shadow-sm uppercase tracking-wider transition-all"
                          >
                            Upgrade Plan
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Close Footer Button */}
              <Button
                onClick={() => setShowSettingsPopup(false)}
                className="w-full h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-black transition-all shadow-sm"
              >
                Close Settings
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── WHEEL LOCKED POPUP ── */}
      <AnimatePresence>
        {showLockedModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm rounded-[2rem] border border-slate-200 dark:border-violet-500/30 bg-white dark:bg-[#110d2c] p-8 text-center shadow-2xl dark:shadow-[0_0_50px_rgba(124,58,237,0.2)] flex flex-col items-center gap-6"
            >
              {/* Locked Wheel Icon */}
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-violet-500/10 blur-xl" />
                <div className="h-20 w-20 rounded-full bg-violet-50 dark:bg-violet-950/50 border border-violet-100 dark:border-violet-500/20 flex items-center justify-center text-4xl shadow-inner">
                  🔒
                </div>
              </div>

              {/* Title & Info */}
              <div className="space-y-2">
                <h2 className="text-xl font-black tracking-wide text-slate-800 dark:text-white uppercase">
                  Wheel Locked!
                </h2>
                <p className="text-slate-500 dark:text-white/60 text-xs tracking-wide">
                  Complete {(() => {
                    const hrs = spinCooldownHours || 2;
                    if (hrs < 1) {
                      const totalSecs = Math.round(hrs * 3600);
                      const mins = Math.floor(totalSecs / 60);
                      const secs = totalSecs % 60;
                      if (mins > 0) {
                        return `${mins} min${mins > 1 ? 's' : ''}${secs > 0 ? ` ${secs} sec${secs > 1 ? 's' : ''}` : ''}`;
                      }
                      return `${secs} sec${secs > 1 ? 's' : ''}`;
                    }
                    return `${hrs} hour${hrs === 1 ? '' : 's'}`;
                  })()} cooldown to spin.
                </p>
                <div className="py-3 px-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl inline-block mt-2">
                  <p className="text-[10px] text-slate-400 dark:text-white/40 uppercase font-black tracking-widest">Cooldown time remaining:</p>
                  <p className="text-lg font-bold text-violet-600 dark:text-violet-400 font-mono mt-1">
                    {parseInt(h)}h {parseInt(m)}m {parseInt(s)}s
                  </p>
                </div>
                <p className="text-[11px] text-violet-500 dark:text-violet-300/80 font-medium mt-3">
                  Please wait {parseInt(h) > 0 ? `${parseInt(h)}h ` : ""}{parseInt(m) > 0 ? `${parseInt(m)}m ` : ""}{parseInt(s)}s more to win exciting rewards!
                </p>
              </div>

              {/* Action Button */}
              <Button
                onClick={() => setShowLockedModal(false)}
                className="w-full h-12 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-550 border border-violet-400/20 text-white font-black uppercase tracking-wider text-xs cursor-pointer shadow-lg shadow-violet-950/20 dark:shadow-violet-900/30"
              >
                Okay, Got it
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── SUBSCRIPTION DETAILS POPUP ── */}
      <AnimatePresence>
        {showSubModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSubModal(false)}
              className="absolute inset-0"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm rounded-[32px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161233] p-8 shadow-2xl text-slate-800 dark:text-slate-100 flex flex-col items-center gap-6"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/20 text-blue-600 mb-2 border border-blue-100 dark:border-blue-900/30">
                <Zap size={28} className="fill-blue-500 text-blue-500" />
              </div>

              {(() => {
                const subStatus = subscription.status || "free";
                const studentClass = student?.class || "";
                const classNum = parseInt(String(studentClass).replace(/\D/g, ""), 10) || 10;
                
                let priceText = "Free";
                if (subStatus === "active") {
                  priceText = classNum >= 11 ? "₹99/month" : classNum >= 9 ? "₹79/month" : "₹59/month";
                } else if (subStatus === "trial") {
                  priceText = "₹1";
                }

                let daysRemaining = 0;
                if (subscription.expiresAt) {
                  const diffTime = new Date(subscription.expiresAt).getTime() - Date.now();
                  daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
                } else if (subscription.trialEndsAt) {
                  const diffTime = new Date(subscription.trialEndsAt).getTime() - Date.now();
                  daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
                }

                return (
                  <div className="w-full text-center space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-black tracking-tight">
                        {subStatus === "trial" ? "3-Day Free Trial" : "VLM Premium Plan"}
                      </h3>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        ● Active
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-left bg-slate-50 dark:bg-black/20 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                      <div>
                        <p className="text-[9px] uppercase tracking-widest text-slate-400 font-black">Plan Cost</p>
                        <p className="text-xs font-bold text-slate-700 dark:text-white mt-0.5">{priceText}</p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase tracking-widest text-slate-400 font-black">Days Remaining</p>
                        <p className="text-xs font-bold text-violet-600 dark:text-violet-400 mt-0.5">{daysRemaining} days left</p>
                      </div>
                      <div className="col-span-2 h-[1px] bg-slate-200/50 dark:bg-white/5 my-0.5" />
                      <div>
                        <p className="text-[9px] uppercase tracking-widest text-slate-400 font-black">Academic Range</p>
                        <p className="text-xs font-bold text-slate-700 dark:text-white mt-0.5">
                          {classNum >= 11 ? "Classes 11–12" : classNum >= 9 ? "Classes 9–10" : "Classes 1–8"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase tracking-widest text-slate-400 font-black">Payment Status</p>
                        <p className="text-xs font-bold text-slate-700 dark:text-white mt-0.5">Auto-Renewing</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2.5 pt-2">
                      <Button
                        onClick={() => {
                          setShowSubModal(false);
                          navigate(PATHS.PLAN_SCREEN);
                        }}
                        className="w-full h-11 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-700 hover:from-violet-500 hover:to-indigo-600 text-white font-black transition-all active:scale-[0.98] shadow-sm border-none cursor-pointer"
                      >
                        Upgrade Plan
                      </Button>
                      <Button
                        onClick={() => setShowSubModal(false)}
                        className="w-full h-11 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-black transition-all active:scale-[0.98] shadow-sm"
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
