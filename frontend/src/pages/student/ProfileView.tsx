import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import {
  User,
  BookOpen,
  Globe,
  ChevronLeft,
  LogOut,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { bgCss } from "@/helper/CssHelper";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import { useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/lib/auth-api";
import { useStudentProfile } from "@/hooks/use-student";
import LoadingSkeleton from "@/components/basic/student/LoadingSkeleton";

export default function ProfileView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile, isLoading, error: profileError } = useStudentProfile();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (profileError) {
      const err = profileError as any;
      if (err?.response?.status === 404) {
        navigate(PATHS.STUDENT_PROFILE_SETUP, { replace: true });
      }
    }
  }, [profileError, navigate]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error(err);
    }
    queryClient.clear();
    navigate(PATHS.SPLASH, { replace: true });
  };

  if (isLoading) return <LoadingSkeleton />;

  const p = (profile as any)?.data ?? profile;
  console.log("ProfileView data:", p);

  return (
    <div className={cn("relative min-h-svh w-full text-white flex flex-col items-center px-6 pt-8 overflow-x-hidden pb-32", bgCss)}>
      <div className="max-w-md w-full flex flex-col gap-6">
        
        {/* ── HEADER ── */}
        <header className="relative w-full flex items-center justify-center mb-6 z-20">
          <h1 className="text-lg font-bold tracking-[0.1em] uppercase">My Profile</h1>
        </header>

        {/* ── PROFILE AVATAR BLOCK ── */}
        <div className="flex flex-col items-center gap-4 p-8 rounded-[32px] border border-white/5 bg-white/[0.02] backdrop-blur-md w-full">
          <div className="relative">
            <div className="relative h-24 w-24 rounded-full border-4 border-cyan-400 bg-black flex items-center justify-center shadow-[0_0_25px_rgba(34,211,238,0.25)] overflow-hidden">
              {p?.profilePhoto ? (
                <img src={p.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-cyan-400" />
              )}
            </div>
          </div>

          <div className="text-center mt-2 space-y-0.5">
            <h2 className="text-2xl font-black text-white tracking-tight">{p?.fullName || "Student"}</h2>
            <p className="text-cyan-400 text-xs font-bold tracking-widest uppercase mt-1">
              Student Profile
            </p>
            {(p?.vlmStudentId) && (
              <div className="mt-3 inline-flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-3 py-1">
                <span className="text-[10px] text-cyan-400 font-bold tracking-widest uppercase">
                  ID:
                </span>
                <span className="text-[10px] font-mono font-bold text-white tracking-widest">
                  {p.vlmStudentId}
                </span>
                <button
                  type="button"
                  title="Copy VLM ID"
                  onClick={() => {
                    navigator.clipboard.writeText(p.vlmStudentId);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="text-cyan-400/60 hover:text-cyan-400 transition-colors cursor-pointer flex items-center gap-1 ml-1"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {copied && (
                    <span className="text-[8px] font-bold text-cyan-400 animate-pulse">
                      Copied!
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── PROFILE DETAILS CARD ── */}
        <div className="p-6 rounded-[32px] border border-white/5 bg-white/[0.02] backdrop-blur-md space-y-6 w-full">
          <div className="flex items-center justify-between border-b border-white/5 pb-4 px-1">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <User size={16} /> Basic Information
            </h3>
            <Button
              onClick={() => navigate(PATHS.EDIT_PROFILE)}
              size="sm"
              className="h-8 px-4 rounded-full text-xs font-bold border border-cyan-400/20 bg-cyan-400/10 hover:bg-cyan-400/20 text-cyan-400 transition-all cursor-pointer"
            >
              Edit Details
            </Button>
          </div>

          <div className="space-y-4">
            <ProfileFieldWrapper icon={<User size={18} className="text-zinc-500 mr-3" />} label="Full Name" value={p?.fullName} />
            <ProfileFieldWrapper icon={<User size={18} className="text-zinc-500 mr-3" />} label="Nickname" value={p?.nickname} />
            <ProfileFieldWrapper icon={<BookOpen size={18} className="text-zinc-500 mr-3" />} label="Class" value={p?.class ? `Class ${p.class}th` : undefined} />
            <ProfileFieldWrapper icon={<Globe size={18} className="text-zinc-500 mr-3" />} label="City" value={p?.city} />
          </div>
        </div>

        {/* ── HISTORY / NAVIGATION CARD ── */}
        <div className="p-4 rounded-[32px] border border-white/5 bg-white/[0.02] backdrop-blur-md w-full">
          <div 
            onClick={() => navigate(PATHS.SESSION_HISTORY)}
            className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-black/40 cursor-pointer hover:bg-black/60 transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <History size={18} className="text-purple-400" />
              </div>
              <div className="text-left">
                <span className="text-sm font-bold text-white block">Session History</span>
                <span className="text-[10px] text-white/40 block mt-0.5">Click to view past chats and calls</span>
              </div>
            </div>
            <ChevronLeft size={16} className="text-white/30 rotate-180" />
          </div>
        </div>

        {/* ── LOGOUT CARD ── */}
        <div className="p-4 rounded-[32px] border border-red-500/10 bg-red-500/[0.01] backdrop-blur-md w-full">
          <Button
            onClick={() => setShowLogoutModal(true)}
            variant="ghost"
            className="w-full h-14 rounded-2xl border border-red-500/20 bg-red-950/10 text-red-400 font-bold hover:bg-red-950/20 hover:text-red-300 hover:border-red-500/40 flex justify-between px-4 transition-all duration-300"
          >
            <span className="flex items-center gap-2">
              <LogOut size={18} />
              Log Out
            </span>
            <ChevronLeft size={18} className="rotate-180 opacity-50" />
          </Button>
        </div>

      </div>

      {/* ── LOGOUT CONFIRMATION POPUP ── */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm rounded-[32px] border border-white/10 bg-zinc-900/90 p-8 text-center shadow-2xl backdrop-blur-xl"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-500 mb-6">
                <LogOut size={28} />
              </div>

              <h3 className="text-xl font-black text-white tracking-tight">
                Log Out?
              </h3>
              <p className="mt-2 text-sm text-zinc-400 font-medium">
                Are you sure you want to log out of your student account?
              </p>

              <div className="mt-8 flex flex-col gap-3">
                <Button
                  onClick={handleLogout}
                  className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold tracking-wide transition-all active:scale-[0.98]"
                >
                  Log Out
                </Button>
                <Button
                  onClick={() => setShowLogoutModal(false)}
                  variant="outline"
                  className="w-full h-12 rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10 font-bold tracking-wide transition-all active:scale-[0.98]"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

function ProfileFieldWrapper({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
}) {
  return (
    <div className="space-y-1 text-left">
      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider ml-2">{label}</label>
      <div className="flex items-center p-4 rounded-2xl bg-black/40 border border-white/5 text-white">
        {icon}
        <span className="flex-1 text-sm font-semibold truncate text-white/95">{value || "Not set"}</span>
      </div>
    </div>
  );
}
