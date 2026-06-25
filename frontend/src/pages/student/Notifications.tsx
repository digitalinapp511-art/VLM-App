import { bgCss } from "@/helper/CssHelper";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { ChevronLeft, Bell, Calendar, BookOpen, Settings } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studentApi } from "@/lib/student-api";

// Shadcn Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string; // 'alert', 'info', 'success'
  isRead?: boolean;
  createdAt: string;
};

export default function StudentNotifications() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: rawNotifications, isLoading } = useQuery<any>({
    queryKey: ["studentNotifications"],
    queryFn: studentApi.getNotifications,
  });

  const markRead = useMutation({
    mutationFn: studentApi.markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studentNotifications"] });
    },
  });

  const notifications: Notification[] = Array.isArray(rawNotifications?.data) 
    ? rawNotifications.data 
    : Array.isArray(rawNotifications) 
      ? rawNotifications 
      : [];

  return (
    <div className={`${bgCss} min-h-svh w-full text-white flex flex-col items-center pb-7 overflow-x-hidden`}>
      <div className="max-w-xl m-auto min-h-svh w-full text-white pb-10">
        
        {/* ── HEADER ── */}
        <header className="flex items-center justify-between px-6 pt-10 pb-6 relative z-10">
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-white/10 bg-white/5 text-white backdrop-blur-md" onClick={() => navigate(-1)}>
            <ChevronLeft size={24} />
          </Button>
          <h1 className="text-xl font-bold tracking-tight">Notifications</h1>
          <div className="w-12" /> {/* Spacer for centering */}
        </header>

        <main className="px-6 space-y-4 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 w-full bg-white/5 rounded-2xl" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center pt-20 opacity-50 space-y-4">
              <Bell className="h-16 w-16 text-white/40" />
              <p className="text-white/60">No new notifications</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <Card 
                key={notif.id}
                onClick={() => {
                  if (!notif.isRead) markRead.mutate(notif.id);
                }}
                className={cn(
                  "border-white/10 backdrop-blur-md rounded-2xl transition-all",
                  notif.isRead ? "bg-black/40" : "bg-cyan-900/20 border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.1)] cursor-pointer hover:bg-cyan-900/30"
                )}
              >
                <CardContent className="p-4 flex gap-4">
                  <div className={cn(
                    "h-10 w-10 shrink-0 rounded-full flex items-center justify-center",
                    notif.type === 'alert' ? "bg-red-500/20 text-red-400" :
                    notif.type === 'success' ? "bg-green-500/20 text-green-400" :
                    "bg-cyan-500/20 text-cyan-400"
                  )}>
                    <Bell className="h-5 w-5" />
                  </div>
                  <div className="space-y-1 w-full">
                    <div className="flex justify-between items-start w-full">
                      <p className="text-sm font-bold text-white">{notif.title}</p>
                      <span className="text-[10px] text-white/40 whitespace-nowrap">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-white/60 leading-relaxed">{notif.message}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </main>

      </div>
    </div>
  );
}
