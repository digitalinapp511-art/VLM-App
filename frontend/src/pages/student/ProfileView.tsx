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
import { motion, AnimatePresence } from "framer-motion";

// Shadcn & UI Components
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/lib/auth-api";
import { useStudentProfile } from "@/hooks/use-student";
import LoadingSkeleton from "@/components/basic/student/LoadingSkeleton";
import { toast } from "sonner";

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

  return (
    <div className="relative min-h-svh w-full bg-[#f4f6ff] text-slate-800 flex flex-col items-center px-5 pt-4 overflow-x-hidden pb-32 font-sans">
      <div className="max-w-md w-full flex flex-col gap-5">
        
        {/* ── HEADER ── */}
        <header className="flex w-full items-center gap-4 pb-2 border-b border-slate-100 shrink-0">
          <button
            onClick={() => navigate(PATHS.STUDENT_DASHBOARD)}
            className="h-10 w-10 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-600 hover:text-slate-800 active:scale-90 transition-transform"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-sm font-black tracking-tight text-slate-800">My Profile</h1>
        </header>

        {/* ── PROFILE AVATAR BLOCK ── */}
        <div className="flex flex-col items-center gap-4 p-6 rounded-3xl border border-slate-100 bg-white shadow-sm w-full">
          <div className="relative">
            <div className="relative h-24 w-24 rounded-full border-4 border-violet-400 bg-slate-50 flex items-center justify-center shadow-md overflow-hidden">
              {p?.profilePhoto ? (
                <img src={p.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={38} className="text-violet-500" />
              )}
            </div>
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">{p?.fullName || "Student"}</h2>
            <p className="text-violet-600 text-xs font-black tracking-wider uppercase">
              Student Profile
            </p>
            {p?.vlmStudentId && (
              <div className="mt-2 inline-flex items-center gap-1.5 bg-violet-50 border border-violet-100 rounded-full px-3 py-1">
                <span className="text-[9px] text-violet-500 font-black tracking-wider uppercase">
                  ID:
                </span>
                <span className="text-[10px] font-mono font-black text-slate-700 tracking-wider">
                  {p.vlmStudentId}
                </span>
                <button
                  type="button"
                  title="Copy VLM ID"
                  onClick={() => {
                    navigator.clipboard.writeText(p.vlmStudentId);
                    setCopied(true);
                    toast.success("VLM ID copied to clipboard");
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="text-violet-500 hover:text-violet-700 transition-colors cursor-pointer flex items-center gap-0.5 ml-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {copied && (
                    <span className="text-[8px] font-black text-violet-500 animate-pulse">
                      Copied
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── PROFILE DETAILS CARD ── */}
        <div className="p-5 rounded-3xl border border-slate-100 bg-white shadow-sm space-y-5 w-full">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 px-0.5">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wide flex items-center gap-2">
              <User size={15} className="text-violet-600" /> Basic Information
            </h3>
            <Button
              onClick={() => navigate(PATHS.EDIT_PROFILE)}
              className="h-8 px-4 rounded-2xl text-[10px] font-black border border-violet-200 bg-violet-50 hover:bg-violet-100 text-violet-600 transition-all cursor-pointer shadow-sm"
            >
              Edit Details
            </Button>
          </div>

          <div className="space-y-3.5">
            <ProfileFieldWrapper icon={<User size={16} className="text-violet-600 mr-2.5" />} label="Full Name" value={p?.fullName} />
            <ProfileFieldWrapper icon={<User size={16} className="text-violet-600 mr-2.5" />} label="Nickname" value={p?.nickname} />
            <ProfileFieldWrapper icon={<BookOpen size={16} className="text-violet-600 mr-2.5" />} label="Class" value={p?.class ? `Class ${p.class}th` : undefined} />
            <ProfileFieldWrapper icon={<Globe size={16} className="text-violet-600 mr-2.5" />} label="City" value={p?.city} />
          </div>
        </div>

        {/* ── HISTORY / NAVIGATION CARD ── */}
        <div className="p-3 rounded-3xl border border-slate-100 bg-white shadow-sm w-full">
          <div 
            onClick={() => navigate(PATHS.SESSION_HISTORY)}
            className="flex items-center justify-between p-3 rounded-2xl border border-slate-50 bg-slate-50/50 cursor-pointer hover:bg-slate-50 transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-violet-100 flex items-center justify-center">
                <History size={16} className="text-violet-600" />
              </div>
              <div className="text-left">
                <span className="text-xs font-black text-slate-800 block">Session History</span>
                <span className="text-[9px] text-slate-400 block mt-0.5">Click to view past chats and calls</span>
              </div>
            </div>
            <ChevronLeft size={16} className="text-slate-400 rotate-180" />
          </div>
        </div>

        {/* ── LOGOUT CARD ── */}
        <div className="p-3 rounded-3xl border border-red-100 bg-white shadow-sm w-full">
          <Button
            onClick={() => setShowLogoutModal(true)}
            variant="ghost"
            className="w-full h-12 rounded-2xl border border-red-100 bg-red-50/40 text-red-500 font-black hover:bg-red-50 hover:text-red-600 flex justify-between px-3 transition-all duration-300 shadow-sm"
          >
            <span className="flex items-center gap-2">
              <LogOut size={16} />
              Log Out
            </span>
            <ChevronLeft size={16} className="rotate-180 opacity-50" />
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
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm rounded-[32px] border border-slate-100 bg-white p-8 text-center shadow-2xl text-slate-800"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500 mb-6 border border-red-100">
                <LogOut size={28} />
              </div>

              <h3 className="text-lg font-black text-slate-800 tracking-tight">
                Log Out?
              </h3>
              <p className="mt-2 text-xs text-slate-400 font-bold leading-relaxed">
                Are you sure you want to log out of your student account?
              </p>

              <div className="mt-6 flex flex-col gap-3">
                <Button
                  onClick={handleLogout}
                  className="w-full h-11 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-black transition-all active:scale-[0.98] shadow-sm"
                >
                  Log Out
                </Button>
                <Button
                  onClick={() => setShowLogoutModal(false)}
                  className="w-full h-11 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-black transition-all active:scale-[0.98] shadow-sm"
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
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">{label}</label>
      <div className="flex items-center p-3 rounded-2xl bg-slate-50 border border-slate-100 text-slate-700">
        {icon}
        <span className="flex-1 text-xs font-bold truncate text-slate-700">{value || "Not set"}</span>
      </div>
    </div>
  );
}
