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
import { useState } from "react";
import DashboardLoading from "@/components/basic/DashboardLoading";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import {
  Bell, Menu, X, Home as HomeIcon, BookOpen, Tv, Gift, Compass, Settings, Zap, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Feature components
import { useStudentDashboard } from "@/features/student/hooks/use-student-dashboard";
import HeroBanner from "@/features/student/components/dashboard/HeroBanner";
import LiveSupportBanner from "@/features/student/components/dashboard/LiveSupportBanner";
import QuickAccessGrid from "@/features/student/components/dashboard/QuickAccessGrid";
import SubjectProgress from "@/features/student/components/dashboard/SubjectProgress";
import RewardsBanner from "@/features/student/components/dashboard/RewardsBanner";
import MiniCards from "@/features/student/components/dashboard/MiniCards";
import StudentBottomNav from "@/features/student/components/layout/StudentBottomNav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import logoImg from "@/assets/logo.png";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {
    isLoading,
    nickname,
    photo,
    streak,
    totalPoints,
    level,
    mcqCompleted,
    mcqTotal,
    activeTeachersCount,
  } = useStudentDashboard();

  if (isLoading) return <DashboardLoading />;

  const menuItems = [
    { label: "Home", icon: <HomeIcon size={20} />, to: PATHS.STUDENT_DASHBOARD },
    { label: "My Courses", icon: <BookOpen size={20} />, to: PATHS.LIBRARY },
    { label: "Live Classes", icon: <Tv size={20} />, to: PATHS.LIVE_CLASSES },
    { label: "Rewards", icon: <Gift size={20} />, to: PATHS.SPINNER },
    { label: "Career Guide", icon: <Compass size={20} />, to: PATHS.COMING_SOON },
    { label: "Settings", icon: <Settings size={20} />, to: PATHS.EDIT_PROFILE },
  ];

  return (
    <div className="min-h-svh bg-[#f4f6ff] pb-28 font-sans relative overflow-x-hidden">
      
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
              className="fixed top-0 bottom-0 left-0 w-80 bg-white z-[100] shadow-2xl flex flex-col p-6 border-r border-slate-100"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-6 border-b border-slate-100">
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
                      navigate(item.to);
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
      <header className="max-w-xl mx-auto flex items-center justify-between px-5 pt-4 pb-3">
        {/* Left Menu Button + Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="h-10 w-10 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-600 hover:text-slate-800 active:scale-90 transition-transform"
          >
            <Menu size={20} />
          </button>
          <img src={logoImg} alt="VLM Academy Logo" className="h-14 w-auto object-contain" />
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          {/* Notification bell */}
          <button
            onClick={() => navigate(PATHS.STUDENT_NOTIFICATIONS)}
            className="relative h-9 w-9 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center"
          >
            <Bell size={18} className="text-slate-600" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full border border-white" />
            {/* Notification count badge */}
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-white text-[8px] font-black flex items-center justify-center">
              3
            </span>
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
      <main className="max-w-xl mx-auto space-y-4">
        {/* 1. Hero Banner */}
        <HeroBanner
          nickname={nickname}
          streak={streak}
          totalPoints={totalPoints}
          level={level}
        />

        {/* 2. Live Support Strip */}
        <LiveSupportBanner activeTeachersCount={activeTeachersCount} />

        {/* 3. Quick Access Grid */}
        <QuickAccessGrid />

        {/* 4. Subject Progress */}
        <SubjectProgress />

        {/* 5. Rewards Banner */}
        <RewardsBanner />

        {/* 6. Mini Cards (Daily Goal / Upcoming Test / AI Tutor) */}
        <MiniCards mcqCompleted={mcqCompleted} mcqTotal={mcqTotal} />
      </main>

      {/* ── Fixed Bottom Nav ───────────────────────────────────────────── */}
      <StudentBottomNav />
    </div>
  );
}
