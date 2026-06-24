import React from "react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import TeacherRequestCard from "@/components/basic/teacher/TeacherRequestCard";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { teacherApi } from "@/lib/teacher-api";
import { useSearchParams } from "react-router-dom";

const DirectRequestNotification: React.FC = () => {
  const [searchParams] = useSearchParams();
  // const navigate = useNavigate();
  const sessionId = searchParams.get("sessionId");

  // Fetch pending sessions to find the latest request
  const { data: sessions } = useQuery({
    queryKey: ["teacherPendingSessions"],
    queryFn: () => teacherApi.getSessions({ status: "PENDING" }),
  });

  const pendingSession = sessionId
    ? sessions?.find((s: any) => s.id === sessionId)
    : sessions?.[0];

  const acceptMutation = useMutation({
    mutationFn: (id: string) => teacherApi.acceptSessionRequest(id),
    onSuccess: () => {
      toast.success("Request accepted! Connecting to session...");
      // navigate(PATHS.TEACHER_SESSION);
    },
    onError: () => toast.error("Failed to accept request"),
  });

  const declineMutation = useMutation({
    mutationFn: (id: string) => teacherApi.declineSessionRequest(id),
    onSuccess: () => toast.error("Request declined"),
    onError: () => toast.error("Failed to decline request"),
  });

  const handleAccept = () => {
    if (pendingSession?.id) {
      acceptMutation.mutate(pendingSession.id);
    } else {
      toast.success("Request accepted! Connecting to session...");
    }
  };

  const handleDecline = () => {
    if (pendingSession?.id) {
      declineMutation.mutate(pendingSession.id);
    } else {
      toast.error("Request declined");
    }
  };

  return (
    <div className={cn("min-h-screen flex items-center justify-center p-6", bgCss)}>
      {/* Background Decorators */}
      <div className="absolute top-1/4 -right-10 w-40 h-40 bg-purple-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -left-10 w-40 h-40 bg-cyan-500/10 blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-xl">
        <TeacherRequestCard 
          onAccept={handleAccept} 
          onDecline={handleDecline} 
        />
      </div>
    </div>
  );
};

export default DirectRequestNotification;