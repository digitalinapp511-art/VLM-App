import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronDown, BookOpen, MessageSquare, Video, HelpCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { PATHS } from "@/routes/paths";

export default function ParentControls() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Form states
  const [dailyTargetHours, setDailyTargetHours] = useState(4);
  const [appUsageLimitMinutes, setAppUsageLimitMinutes] = useState(150); // 2h 30m = 150m
  const [chatEnabled, setChatEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [liveClassEnabled, setLiveClassEnabled] = useState(false);

  // Fetch Parent Dashboard / children list
  const { data: dashboardData, isLoading } = useQuery<any>({
    queryKey: ["parentDashboardControls"],
    queryFn: async () => {
      const { data } = await apiClient.get("/parent/dashboard");
      return data.data;
    }
  });

  const children = dashboardData?.children || [];
  const parentName = dashboardData?.parent?.fullName || "Parent";

  // Fetch Parent Profile to load current controls
  const { data: profileData } = useQuery<any>({
    queryKey: ["parentProfileControls"],
    queryFn: async () => {
      const { data } = await apiClient.get("/parent/profile");
      return data.data;
    }
  });

  useEffect(() => {
    if (profileData?.controls) {
      const ctrl = profileData.controls;
      if (ctrl.dailyStudyHours !== undefined) setDailyTargetHours(ctrl.dailyStudyHours);
      if (ctrl.appUsageLimit !== undefined) setAppUsageLimitMinutes(ctrl.appUsageLimit);
      if (ctrl.featureControl) {
        if (ctrl.featureControl.chat !== undefined) setChatEnabled(ctrl.featureControl.chat);
        if (ctrl.featureControl.videoCall !== undefined) setVideoEnabled(ctrl.featureControl.videoCall);
        if (ctrl.featureControl.liveClasses !== undefined) setLiveClassEnabled(ctrl.featureControl.liveClasses);
      }
    }
  }, [profileData]);

  // Mutation to update controls
  const updateMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await apiClient.put("/parent/controls", payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Controls updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["parentProfileControls"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update controls.");
    }
  });

  const handleUpdate = () => {
    updateMutation.mutate({
      dailyStudyHours: dailyTargetHours,
      appUsageLimit: appUsageLimitMinutes,
      featureControl: {
        chat: chatEnabled,
        videoCall: videoEnabled,
        liveClasses: liveClassEnabled
      }
    });
  };

  const handleEditStudyHours = () => {
    const hours = prompt("Set Daily Study Target (in hours):", String(dailyTargetHours));
    if (hours && !isNaN(Number(hours))) {
      setDailyTargetHours(Number(hours));
    }
  };

  const formatUsageLimit = (mins: number) => {
    const hrs = Math.floor(mins / 60);
    const m = mins % 60;
    if (hrs === 0) return `${m}m`;
    if (m === 0) return `${hrs}h`;
    return `${hrs}h ${m}m`;
  };

  const activeChildObj = children[selectedChildIndex];
  const activeStudent = activeChildObj?.student || {};
  const activeStudentName = activeStudent.fullName || "Liam";

  return (
    <div className={cn("min-h-screen flex flex-col items-center p-6 pb-28 relative overflow-hidden bg-[#050505] text-white", bgCss)}>
      <div className="max-w-xl w-full flex flex-col gap-6 pt-2">
        
        {/* --- HEADER --- */}
        <header className="relative w-full flex items-center justify-between z-20">
          <button
            onClick={() => navigate(-1)}
            className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 text-white flex items-center justify-center cursor-pointer transition-colors hover:bg-white/10"
          >
            <ChevronLeft size={20} />
          </button>
          
          <h1 className="text-sm font-bold text-white uppercase tracking-widest flex-1 text-center pr-2 pl-4">
            Parent Controls
          </h1>

          <div className="flex items-center gap-2 text-right">
            <span className="text-[10px] text-zinc-400 font-medium block leading-none">
              Welcome,<br/>
              <span className="text-white font-bold text-xs">{parentName}</span>
            </span>
            <Avatar className="h-9 w-9 border border-white/20 bg-zinc-800">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${parentName}`} />
              <AvatarFallback>{parentName[0]}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* --- CHILD PROFILE PICKER DROPDOWN --- */}
        <div className="relative w-full z-30">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-md cursor-pointer hover:bg-white/[0.04] transition-all"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 border border-white/20">
                <AvatarImage src={activeStudent.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeStudentName}`} />
                <AvatarFallback>{activeStudentName[0]}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-semibold text-white">{activeStudentName}'s Profile</span>
            </div>
            <ChevronDown size={18} className="text-white/40" />
          </button>

          {isDropdownOpen && children.length > 1 && (
            <div className="absolute top-[52px] left-0 w-full rounded-2xl border border-white/10 bg-[#111] p-2 space-y-1 shadow-2xl z-50">
              {children.map((child: any, idx: number) => (
                <button
                  key={child.student?._id || idx}
                  onClick={() => {
                    setSelectedChildIndex(idx);
                    setIsDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left"
                >
                  <Avatar className="h-7 w-7 border border-white/15">
                    <AvatarImage src={child.student?.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${child.student?.fullName}`} />
                    <AvatarFallback>{(child.student?.fullName || "S")[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-semibold text-white">{child.student?.fullName || "Student"}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── DAILY USAGE & STUDY ── */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-2">
            Daily Usage & Study
          </h3>

          {/* Daily Study Hours */}
          <div className="flex items-center justify-between p-5 rounded-[24px] border border-cyan-500/10 bg-[#071317]/10 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <BookOpen size={20} className="text-cyan-400" />
              </div>
              <div className="text-left">
                <span className="text-sm font-bold text-white block">Daily Study Hours</span>
                <span className="text-[10px] text-cyan-400/70 block mt-0.5">Set Daily Target: {dailyTargetHours} Hrs</span>
              </div>
            </div>
            <button 
              onClick={handleEditStudyHours}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
            >
              Edit <ChevronLeft size={12} className="rotate-180" />
            </button>
          </div>

          {/* App Usage Limit (Slider) */}
          <div className="p-6 rounded-[24px] border border-purple-500/10 bg-[#0c0813]/10 backdrop-blur-md space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-white">App Usage Limit</span>
              <span className="text-[9px] font-black uppercase bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full px-2 py-0.5">
                Total App Time Limit
              </span>
            </div>

            <div className="relative pt-2">
              <input
                type="range"
                min="15"
                max="300"
                step="15"
                value={appUsageLimitMinutes}
                onChange={(e) => setAppUsageLimitMinutes(Number(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[9px] text-zinc-500 font-bold mt-2">
                <span>15min</span>
                <span>Max</span>
              </div>
            </div>

            <div className="text-center">
              <span className="text-xs font-medium text-zinc-400">Max Usage: </span>
              <span className="text-xs font-bold text-cyan-400">{formatUsageLimit(appUsageLimitMinutes)}</span>
            </div>
          </div>
        </div>

        {/* ── APP FUNCTIONALITY ── */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-2">
            App Functionality
          </h3>

          <div className="p-5 rounded-[28px] border border-white/5 bg-white/[0.02] backdrop-blur-md space-y-6">
            {/* Chat toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare size={18} className="text-zinc-500" />
                <span className="text-sm font-bold text-white">Chat ON/OFF</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-zinc-400">{chatEnabled ? "ON" : "OFF"}</span>
                <Switch 
                  checked={chatEnabled} 
                  onCheckedChange={setChatEnabled}
                  className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-zinc-800"
                />
              </div>
            </div>

            {/* Video toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Video size={18} className="text-zinc-500" />
                <span className="text-sm font-bold text-white">Video ON/OFF</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-zinc-400">{videoEnabled ? "ON" : "OFF"}</span>
                <Switch 
                  checked={videoEnabled} 
                  onCheckedChange={setVideoEnabled}
                  className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-zinc-800"
                />
              </div>
            </div>

            {/* Live Class toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen size={18} className="text-zinc-500" />
                <span className="text-sm font-bold text-white">Live Class ON/OFF</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-zinc-400">{liveClassEnabled ? "ON" : "OFF"}</span>
                <Switch 
                  checked={liveClassEnabled} 
                  onCheckedChange={setLiveClassEnabled}
                  className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-zinc-800"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── UPDATE CONTROLS BUTTON ── */}
        <div className="mt-2 w-full">
          <Button
            onClick={handleUpdate}
            disabled={updateMutation.isPending}
            className={cn(
              "w-full h-14 rounded-full text-xs font-black tracking-widest transition-all active:scale-[0.98]",
              "bg-gradient-to-r from-blue-900 to-indigo-950 text-white border border-blue-500/30 hover:border-blue-400/50 shadow-lg"
            )}
          >
            {updateMutation.isPending ? "UPDATING..." : "UPDATE CONTROLS"}
          </Button>
        </div>

      </div>
    </div>
  );
}
