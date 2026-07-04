import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { RefreshCw, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { bgCss } from "@/helper/CssHelper";
import { apiClient } from "@/lib/api-client";
import { PATHS } from "@/routes/paths";
import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket";
import { toast } from "sonner";

export default function ParentPendingApproval() {
  const navigate = useNavigate();
  const [initialApprovedCount, setInitialApprovedCount] = useState<number | null>(null);

  // Query to check approved children list
  const { data: dashboardData, refetch } = useQuery<any>({
    queryKey: ["parentDashboardCheck"],
    queryFn: async () => {
      const { data } = await apiClient.get("/parent/dashboard");
      return data.data;
    },
    refetchInterval: 5000, // Poll every 5 seconds as a fallback
  });

  const children = dashboardData?.children || [];

  // Track the initial count of approved children when page loads
  useEffect(() => {
    if (dashboardData && initialApprovedCount === null) {
      setInitialApprovedCount(children.length);
    }
  }, [dashboardData, children.length, initialApprovedCount]);

  useEffect(() => {
    // Redirect to dashboard if a new child has been approved since this page loaded,
    // or if they had zero approved children initially and now have at least one.
    if (initialApprovedCount !== null && (
      (initialApprovedCount === 0 && children.length > 0) || 
      (children.length > initialApprovedCount)
    )) {
      toast.success("Link approved! Welcome to the Parent Dashboard.");
      navigate(PATHS.PARENT_DASHBOARD, { replace: true });
    }
  }, [children.length, initialApprovedCount, navigate]);

  // Connect socket.io for real-time instant redirect when student accepts
  useEffect(() => {
    const token = localStorage.getItem("vlm_token");
    if (token) {
      connectSocket();
      const socket = getSocket();

      socket.on("parent_link_approved", () => {
        refetch();
      });

      return () => {
        socket.off("parent_link_approved");
        disconnectSocket();
      };
    }
  }, [refetch]);

  return (
    <div className={`${bgCss} min-h-screen w-full text-white flex flex-col items-center justify-center p-6 bg-[#050505]`}>
      <div className="max-w-md w-full text-center space-y-8 relative z-10">
        
        {/* Back Button (Only visible if parent already has at least one approved child) */}
        {children.length > 0 && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(PATHS.PARENT_DASHBOARD)}
            className="absolute left-0 top-0 w-9 h-9 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md text-white cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}

        {/* Glow effect */}
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <div className="w-64 h-64 bg-amber-500/10 blur-[100px] rounded-full animate-pulse" />
        </div>

        {/* Branding header */}
        <div className="pt-8">
          <h1 style={{ fontFamily: 'Cinzel, serif' }} className="text-3xl font-bold tracking-[0.15em] text-[#D4AF37] mb-1">
            VLMACADEMY
          </h1>
          <p className="text-[10px] tracking-[0.4em] font-bold text-[#D4AF37]/80 uppercase">
            Parent Module
          </p>
        </div>

        {/* Animated pulsing icon */}
        <div className="flex justify-center">
          <div className="relative flex items-center justify-center w-28 h-28">
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full bg-amber-500/20"
            />
            <div className="w-20 h-20 rounded-full bg-zinc-900 border border-[#D4AF37]/30 flex items-center justify-center shadow-2xl">
              <RefreshCw className="w-10 h-10 text-[#D4AF37] animate-spin" />
            </div>
          </div>
        </div>

        {/* Text Info */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold tracking-tight text-white">
            Waiting for Student Approval
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed px-4">
            We have sent a linking request to your child's student account. 
            Once they log in and accept, this screen will update automatically.
          </p>
        </div>

        {/* Action button */}
        <div className="pt-4 flex flex-col gap-3">
          {children.length > 0 && (
            <Button 
              onClick={() => navigate(PATHS.PARENT_DASHBOARD)}
              className="w-full h-12 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 border-none cursor-pointer"
            >
              Go to Dashboard
            </Button>
          )}

          <Button 
            onClick={() => refetch()}
            className="w-full h-12 rounded-2xl bg-zinc-900 border border-white/10 text-white font-bold text-sm hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-[#D4AF37]" />
            Check Link Status Now
          </Button>

          <Button 
            onClick={() => navigate(PATHS.ADD_CHILD)}
            variant="ghost"
            className="text-xs text-zinc-500 hover:text-white transition-colors cursor-pointer"
          >
            Cancel and add another student
          </Button>
        </div>

      </div>
    </div>
  );
}
