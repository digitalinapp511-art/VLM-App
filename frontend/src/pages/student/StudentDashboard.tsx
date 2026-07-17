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
    mcqCompleted,
    mcqTotal,
    activeTeachersCount,
    unreadNotificationCount,
    pendingParentRequestCount,
  } = useStudentDashboard();

  const unreadCount = unreadNotificationCount;

  const [showLockedModal, setShowLockedModal] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(() => {
    const cached = sessionStorage.getItem("vlm_spin_seconds_left");
    return cached ? parseInt(cached) : 0;
  });

  useEffect(() => {
    if (activeSecondsSinceLastSpin === 0) {
      sessionStorage.removeItem("vlm_spin_seconds_left");
      setSecondsLeft(0);
      return;
    }
    const remSeconds = Math.max(0, 7200 - (activeSecondsSinceLastSpin || 0));
    setSecondsLeft(remSeconds);
    sessionStorage.setItem("vlm_spin_seconds_left", remSeconds.toString());
  }, [activeSecondsSinceLastSpin]);

  useEffect(() => {
    if (secondsLeft > 0) {
      sessionStorage.setItem("vlm_spin_seconds_left", secondsLeft.toString());
      const interval = setInterval(() => {
        setSecondsLeft((prev) => {
          const val = Math.max(0, prev - 1);
          sessionStorage.setItem("vlm_spin_seconds_left", val.toString());
          return val;
        });
      }, 1000);
      return () => clearInterval(interval);
    } else {
      sessionStorage.removeItem("vlm_spin_seconds_left");
    }
  }, [secondsLeft]);

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

                {/* Bottom Premium Upgrade Banner */}
                <div className="mt-6 bg-gradient-to-br from-violet-600 to-indigo-700 p-5 rounded-3xl text-white relative overflow-hidden shadow-xl shadow-violet-500/20">
                  <div className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full bg-white/10 blur-lg" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-1.5 bg-white/20 w-fit px-2.5 py-1 rounded-full text-[9px] font-black tracking-wider uppercase mb-2">
                      <Zap size={10} className="fill-yellow-400 text-yellow-400" /> Premium
                    </div>
                    <p className="text-sm font-black leading-tight">Upgrade to VLM Premium</p>
                    <p className="text-[10px] text-white/70 mt-1 leading-snug">Get unlimited live doubts and professional career counseling</p>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigate(PATHS.PLAN_SCREEN);
                      }}
                      className="mt-4 w-full bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs py-2.5 rounded-2xl shadow-md transition-all active:scale-95 uppercase tracking-wider"
                    >
                      Upgrade Now
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
        <RewardsBanner lastSpinDate={lastSpinDate} activeSecondsSinceLastSpin={activeSecondsSinceLastSpin} onLockedClick={() => setShowLockedModal(true)} />

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
                  Complete 2 hours of active learning to spin.
                </p>
                <div className="py-3 px-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl inline-block mt-2">
                  <p className="text-[10px] text-slate-400 dark:text-white/40 uppercase font-black tracking-widest">Study time remaining:</p>
                  <p className="text-lg font-bold text-violet-600 dark:text-violet-400 font-mono mt-1">
                    {parseInt(h)}h {parseInt(m)}m
                  </p>
                </div>
                <p className="text-[11px] text-violet-500 dark:text-violet-300/80 font-medium mt-3">
                  Use the app for {parseInt(h) > 0 ? `${parseInt(h)}h ` : ""}{parseInt(m)}m more to win exciting rewards!
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
    </div>
  );
}
