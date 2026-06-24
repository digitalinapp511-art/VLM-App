import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Power } from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { teacherApi } from "@/lib/teacher-api";
import { toast } from "sonner";

import StatusOptionCard from "@/components/basic/teacher/StatusOptionCard";
import { OnlineWaveIcon, BusyIcon } from "@/components/basic/teacher/AvailabilityIcons";

type Status = "online" | "offline" | "busy";

const AvailabilityStatus: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Load current status from profile
  const { data: profile } = useQuery({
    queryKey: ["teacherProfile"],
    queryFn: teacherApi.getProfile,
  });

  const getStoredStatus = () => localStorage.getItem("teacher_availability_status") as Status | null;

  const [selectedStatus, setSelectedStatus] = useState<Status>(
    () => getStoredStatus() || (profile?.availabilityStatus as Status) || "online"
  );

  // Sync state when profile loads, but ONLY if there's no local storage override
  React.useEffect(() => {
    if (profile?.availabilityStatus && !getStoredStatus()) {
      setSelectedStatus(profile.availabilityStatus as Status);
    }
  }, [profile?.availabilityStatus]);

  const mutation = useMutation({
    mutationFn: (status: Status) => teacherApi.updateAvailability(status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacherProfile"] });
      queryClient.invalidateQueries({ queryKey: ["teacherDashboard"] });
      toast.success("Availability updated successfully");
    },
    onError: () => toast.error("Failed to sync availability with server"),
  });

  const handleApply = () => {
    // Optimistic UI update: instantly save to localStorage and navigate
    localStorage.setItem("teacher_availability_status", selectedStatus);
    window.dispatchEvent(new StorageEvent("storage", {
      key: "teacher_availability_status",
      newValue: selectedStatus,
    }));
    
    // Fire the API call in the background
    mutation.mutate(selectedStatus);
    
    // Immediately redirect to dashboard
    navigate("/teacher-dashboard"); // PATHS.TEACHER_DASHBOARD
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className={cn("min-h-screen flex flex-col items-center p-6 pb-12", bgCss)}>
      {/* Header */}
      <header className="w-full max-w-xl flex items-center mb-10">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 -ml-2 text-zinc-400 hover:text-white transition-colors"
        >
          <ChevronLeft size={28} />
        </button>
        <h1 className="flex-1 text-center text-sm font-bold text-zinc-400 uppercase tracking-widest mr-7">
          Availability Status
        </h1>
      </header>

      {/* Status Options Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-xl space-y-4"
      >
        <motion.div variants={itemVariants}>
          <StatusOptionCard
            variant="online"
            title="Online"
            description="Instantly accept student requests"
            icon={<OnlineWaveIcon />}
            isSelected={selectedStatus === "online"}
            onClick={() => setSelectedStatus("online")}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <StatusOptionCard
            variant="offline"
            title="Offline"
            description="Not receiving requests"
            icon={<Power size={44} strokeWidth={1.5} />}
            isSelected={selectedStatus === "offline"}
            onClick={() => setSelectedStatus("offline")}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <StatusOptionCard
            variant="busy"
            title="Busy"
            description="Accepting but not instant"
            icon={<BusyIcon />}
            isSelected={selectedStatus === "busy"}
            onClick={() => setSelectedStatus("busy")}
          />
        </motion.div>
      </motion.div>

      {/* Footer Info */}
      <footer className="mt-auto w-full max-w-xl flex flex-col gap-8">
        <p className="text-zinc-500 text-[13px] text-center font-medium leading-relaxed px-4">
          Manage incoming student session requests based on your current availability. 
          Changes take effect instantly.
        </p>

        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <Button
            onClick={handleApply}
            disabled={mutation.isPending}
            className={cn(
              "w-full h-16 rounded-full text-lg font-bold transition-all",
              "bg-gradient-to-r from-[#2b4b9b] to-[#1a2e5d] hover:brightness-110",
              "border border-white/10 shadow-2xl text-white flex items-center justify-center gap-2"
            )}
          >
            {mutation.isPending ? "Updating..." : "Apply Status >"}
          </Button>
        </motion.div>
      </footer>
    </div>
  );
};

export default AvailabilityStatus;