import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Camera, User, BookOpen, Star, Mail, Phone, ShieldCheck, Home, Wallet, Library } from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { teacherApi } from "@/lib/teacher-api";
import { PATHS } from "@/routes/paths";

export default function TeacherProfile() {
  const navigate = useNavigate();
  const { data: profile, isLoading } = useQuery({
    queryKey: ["teacherProfile"],
    queryFn: teacherApi.getProfile,
  });

  const p = profile?.user || {};

  return (
    <div className={cn("min-h-screen flex flex-col items-center p-6 pb-28 relative overflow-hidden", bgCss)}>
      {/* Decorative Assets */}
      <div className="absolute top-1/4 -right-4 text-cyan-400/20 blur-[1px] rotate-45">
        <Star size={16} fill="currentColor" />
      </div>
      <div className="absolute top-[40%] -left-3 text-purple-500/30 blur-[1px]">
        <Star size={20} fill="currentColor" />
      </div>

      {/* Header */}
      <header className="w-full max-w-xl flex items-center mb-10 z-10">
        <h1 className="flex-1 text-center text-sm font-bold text-zinc-400 uppercase tracking-widest mr-7">
          My Profile
        </h1>
      </header>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl space-y-6"
      >
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-4 p-8 rounded-[32px] border border-white/5 bg-white/[0.02] backdrop-blur-md">
          <div className="relative group">
            <Avatar className="w-24 h-24 border-2 border-white/10 bg-zinc-800">
              <AvatarImage src={profile?.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.fullName || "Teacher"}`} />
              <AvatarFallback>{(profile?.fullName || "T")[0]}</AvatarFallback>
            </Avatar>
            <button 
              onClick={() => navigate(PATHS.TEACHER_EDIT_PROFILE)}
              className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full border-2 border-black hover:bg-blue-500 transition-colors shadow-lg"
            >
              <Camera size={16} className="text-white" />
            </button>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-black text-white tracking-tight">
              {isLoading ? "Loading..." : profile?.fullName || profile?.user?.fullName || "Teacher"}
            </h2>
            <p className="text-cyan-400 text-xs font-bold tracking-widest uppercase mt-1">
              {profile?.applicationStatus === "approved" ? "Verified Teacher" : "Profile Draft"}
            </p>
          </div>
        </div>

        {/* Info Form */}
        <div className="p-6 rounded-[32px] border border-white/5 bg-white/[0.02] backdrop-blur-md space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <User size={16} /> Basic Information
            </h3>
            <Button
              onClick={() => navigate(PATHS.TEACHER_EDIT_PROFILE)}
              size="sm"
              className="h-8 px-4 rounded-full text-xs font-bold border border-cyan-400/20 bg-cyan-400/10 hover:bg-cyan-400/20 text-cyan-400 transition-all"
            >
              Edit Details
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-zinc-500 uppercase ml-2">Full Name</label>
              <div className="mt-1 flex items-center p-4 rounded-2xl bg-black/40 border border-white/5 text-white">
                <User size={18} className="text-zinc-600 mr-3" />
                <span className="flex-1">{profile?.fullName || profile?.user?.fullName || "N/A"}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-500 uppercase ml-2">Phone Number</label>
              <div className="mt-1 flex items-center p-4 rounded-2xl bg-black/40 border border-white/5 text-white">
                <Phone size={18} className="text-zinc-600 mr-3" />
                <span className="flex-1">{profile?.user?.mobile || "N/A"}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-500 uppercase ml-2">Email Address</label>
              <div className="mt-1 flex items-center p-4 rounded-2xl bg-black/40 border border-white/5 text-white">
                <Mail size={18} className="text-zinc-600 mr-3" />
                <span className="flex-1">{profile?.user?.email || "Not Provided"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Status */}
        <div className="p-6 rounded-[32px] border border-white/5 bg-white/[0.02] backdrop-blur-md space-y-4">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest border-b border-white/5 pb-4 flex items-center gap-2">
            <ShieldCheck size={16} /> Status
          </h3>
          <Button
            onClick={() => navigate(PATHS.VERIFICATION_STATUS)}
            variant="outline"
            className="w-full h-14 rounded-2xl border border-white/10 bg-white/5 text-white font-medium hover:bg-white/10 flex justify-between px-4"
          >
            <span>View Verification Status</span>
            <ChevronLeft size={18} className="rotate-180" />
          </Button>
        </div>

      </motion.div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full bg-[#0a0a0a]/95 border-t border-white/5 backdrop-blur-lg px-6 py-4 flex items-center justify-between z-50">
        <NavItem icon={<Home />} label="Home" onClick={() => navigate(PATHS.TEACHER_DASHBOARD)} />
        <NavItem icon={<BookOpen />} label="Classes" onClick={() => navigate(PATHS.TEACHER_CLASSES)} />
        <NavItem icon={<Wallet />} label="Wallet" onClick={() => navigate(PATHS.TEACHER_WALLET)} />
        <NavItem icon={<Library />} label="Library" onClick={() => navigate(PATHS.TEACHER_LIBRARY)} />
        <NavItem icon={<User />} label="Profile" active onClick={() => navigate(PATHS.TEACHER_PROFILE)} />
      </nav>
    </div>
  );
}

const NavItem = ({ icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex flex-col items-center gap-1.5 transition-all duration-300",
      active ? "text-cyan-400" : "text-zinc-600 hover:text-zinc-400"
    )}
  >
    <div className={cn("relative", active && "drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]")}>
      {React.cloneElement(icon, { size: 24, strokeWidth: active ? 2.5 : 1.5 })}
    </div>
    <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    {active && <motion.div layoutId="navDot" className="w-1 h-1 rounded-full bg-cyan-400" />}
  </button>
);
