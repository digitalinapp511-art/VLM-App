import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Globe, Bell, Shield, LogOut, User, Sliders, Pencil, RefreshCw } from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { PATHS } from "@/routes/paths";
import { authApi } from "@/lib/auth-api";
import ParentLayout from "@/components/layout/ParentLayout";
import { toast } from "sonner";

export default function ParentProfile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const form = new FormData();
      form.append("photo", file);
      const { data } = await apiClient.post("/parent/profile/photo", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (data?.url) {
        queryClient.invalidateQueries({ queryKey: ["parentProfile"] });
        toast.success("Profile photo updated on Cloudinary!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload profile photo");
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => handlePhotoUpload(e as any);
    input.click();
  };

  const { data: profile, isLoading } = useQuery<any>({
    queryKey: ["parentProfile"],
    queryFn: async () => {
      const { data } = await apiClient.get("/parent/profile");
      return data.data;
    },
  });

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
    queryClient.clear();
    navigate(PATHS.LOGIN_PARENT, { replace: true });
  };

  const parentName = profile?.fullName || "Parent";
  const parentEmail = profile?.userId?.email || profile?.email || "parent@vlm.com";

  return (
    <ParentLayout>
      <div className="max-w-xl w-full flex flex-col gap-6 pt-2">
        {/* Header */}
        <header className="relative w-full flex items-center justify-center z-20">
          <h1 className="text-sm font-bold text-zinc-400 uppercase tracking-widest text-center">
            Settings
          </h1>
        </header>

        {/* ── PROFILE CARD ── */}
        <div className="flex items-center justify-between p-6 rounded-[32px] border border-white/5 bg-white/[0.02] backdrop-blur-md w-full relative">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-16 h-16 border border-white/10 bg-zinc-800">
                <AvatarImage src={profile?.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${parentName}`} />
                <AvatarFallback>{parentName[0]}</AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={triggerFileInput}
                disabled={isUploading}
                className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-cyan-400 text-black flex items-center justify-center border border-black shadow-md cursor-pointer hover:bg-cyan-300 active:scale-95 transition-all"
              >
                {isUploading ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <Pencil className="h-3 w-3" />
                )}
              </button>
            </div>
            <div className="text-left">
              <p className="text-[10px] text-white/40 font-bold tracking-widest uppercase">
                Edit Profile
              </p>
              <h2 className="text-lg font-black text-white tracking-tight mt-0.5">
                {isLoading ? "Loading..." : parentName}
              </h2>
              <p className="text-xs text-white/50 truncate max-w-[200px] mt-0.5">
                {parentEmail}
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-white/30" />
        </div>

        {/* ── SETTINGS MENU ITEMS ── */}
        <div className="space-y-4 w-full">
          {/* Parent Controls */}
          <div 
            onClick={() => navigate(PATHS.PARENT_CONTROLS)}
            className="flex items-center justify-between p-5 rounded-[24px] border border-white/5 bg-white/[0.02] backdrop-blur-md cursor-pointer hover:bg-white/[0.04] transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <Sliders size={20} className="text-cyan-400" />
              </div>
              <div className="text-left">
                <span className="text-sm font-bold text-white block">Parent Controls</span>
                <span className="text-[10px] text-white/40 block mt-0.5">Manage daily usage limit and features</span>
              </div>
            </div>
            <ChevronRight size={16} className="text-white/30" />
          </div>

          {/* Language */}
          <div className="flex items-center justify-between p-5 rounded-[24px] border border-white/5 bg-white/[0.02] backdrop-blur-md cursor-pointer hover:bg-white/[0.04] transition-all">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <Globe size={20} className="text-cyan-400" />
              </div>
              <div className="text-left">
                <span className="text-sm font-bold text-white block">Language</span>
                <span className="text-[10px] text-white/40 block mt-0.5">English (US)</span>
              </div>
            </div>
            <ChevronRight size={16} className="text-white/30" />
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between p-5 rounded-[24px] border border-white/5 bg-white/[0.02] backdrop-blur-md cursor-pointer hover:bg-white/[0.04] transition-all">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Bell size={20} className="text-amber-400" />
              </div>
              <div className="text-left">
                <span className="text-sm font-bold text-white block">Notifications</span>
                <span className="text-[10px] text-white/40 block mt-0.5">Push and Email Alerts</span>
              </div>
            </div>
            <ChevronRight size={16} className="text-white/30" />
          </div>

          {/* Privacy */}
          <div className="flex items-center justify-between p-5 rounded-[24px] border border-white/5 bg-white/[0.02] backdrop-blur-md cursor-pointer hover:bg-white/[0.04] transition-all">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <Shield size={20} className="text-green-400" />
              </div>
              <div className="text-left">
                <span className="text-sm font-bold text-white block">Privacy</span>
                <span className="text-[10px] text-white/40 block mt-0.5">Data & Security</span>
              </div>
            </div>
            <ChevronRight size={16} className="text-white/30" />
          </div>

          {/* Logout */}
          <div 
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center justify-between p-5 rounded-[24px] border border-red-500/10 bg-red-500/[0.01] backdrop-blur-md cursor-pointer hover:bg-red-500/[0.03] transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <LogOut size={20} className="text-red-400" />
              </div>
              <div className="text-left">
                <span className="text-sm font-bold text-white block">Logout</span>
                <span className="text-[10px] text-red-400/50 block mt-0.5">Sign out of your account</span>
              </div>
            </div>
            <ChevronRight size={16} className="text-red-400/30" />
          </div>
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
                Are you sure you want to log out of your parent account?
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
    </ParentLayout>
  );
}
