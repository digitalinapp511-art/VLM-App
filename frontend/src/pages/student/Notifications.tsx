import { useEffect, useRef } from "react";
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string; 
  isRead?: boolean;
  createdAt: string;
};

export default function StudentNotifications() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const hasSentRead = useRef(false);

  const { data: rawNotifications, isLoading } = useQuery<any>({
    queryKey: ["studentNotifications"],
    queryFn: studentApi.getNotifications,
  });

  const { data: parentRequests, refetch: refetchParentRequests } = useQuery<any[]>({
    queryKey: ["parentRequests"],
    queryFn: studentApi.getParentRequests,
  });

  const markRead = useMutation({
    mutationFn: studentApi.markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studentNotifications"] });
    },
  });

  const markAllRead = useMutation({
    mutationFn: studentApi.markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studentNotifications"] });
    },
  });

  const notifications: Notification[] = (Array.isArray(rawNotifications?.data) 
    ? rawNotifications.data 
    : Array.isArray(rawNotifications) 
      ? rawNotifications 
      : []).filter((n: any) => n.type !== 'parent_link_request');

  // Mark all as read automatically on view/mount (only once per mount)
  useEffect(() => {
    if (notifications.length > 0 && !hasSentRead.current) {
      const hasUnread = notifications.some((n) => !n.isRead);
      if (hasUnread) {
        hasSentRead.current = true;
        markAllRead.mutate();
      }
    }
  }, [notifications]);

  return (
    <div className="relative flex min-h-svh w-full flex-col items-center bg-[#f4f6ff] dark:bg-[#0b081e] px-6 py-8 overflow-hidden text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <div className="max-w-xl w-full flex flex-col min-h-svh pb-10">
        
        {/* ── HEADER ── */}
        <header className="flex items-center justify-between px-4 pb-6 relative z-10">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-10 w-10 rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white active:scale-95 transition-all" 
            onClick={() => navigate(-1)}
          >
            <ChevronLeft size={20} />
          </Button>
          <h1 className="text-lg font-black tracking-tight text-slate-800 dark:text-slate-100">Notifications</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </header>

        <main className="px-4 space-y-4 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Parent Linking Requests */}
          {parentRequests && parentRequests.map((request: any) => (
            <Card key={request._id} className="border-violet-100 dark:border-[#221c4e] bg-white dark:bg-[#161233] shadow-sm rounded-3xl text-left">
              <CardContent className="p-4 flex flex-col gap-4">
                <div className="flex gap-4">
                  <Avatar className="w-10 h-10 border border-violet-150">
                    <AvatarImage src={request.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.fullName}`} />
                    <AvatarFallback>{request.fullName?.[0] || 'P'}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1 text-left flex-1">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Parent Linking Request</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Parent <span className="text-violet-600 dark:text-violet-400 font-bold">{request.fullName}</span> ({request.email || request.mobile || "No Contact Info"}) wants to link with your account.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <Button 
                    onClick={async () => {
                      try {
                        await studentApi.approveParentRequest(request._id);
                        toast.success("Parent linked successfully!");
                        refetchParentRequests();
                      } catch (err) {
                        toast.error("Failed to approve request.");
                      }
                    }}
                    className="h-9 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs"
                  >
                    Accept
                  </Button>
                  <Button 
                    onClick={async () => {
                      try {
                        await studentApi.rejectParentRequest(request._id);
                        toast.success("Request declined.");
                        refetchParentRequests();
                      } catch (err) {
                        toast.error("Failed to decline request.");
                      }
                    }}
                    variant="outline"
                    className="h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-600 dark:text-slate-400 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-900"
                  >
                    Decline
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 w-full bg-white dark:bg-[#161233] border border-slate-100 dark:border-[#221c4e] rounded-2xl" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center pt-20 opacity-50 space-y-4">
              <Bell className="h-16 w-16 text-slate-400 dark:text-slate-650" />
              <p className="text-slate-500 dark:text-slate-400 text-sm font-bold">No new notifications</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <Card 
                key={notif.id}
                onClick={() => {
                  if (!notif.isRead) markRead.mutate(notif.id);
                }}
                className={cn(
                  "border rounded-2xl transition-all cursor-pointer text-left shadow-sm",
                  notif.isRead 
                    ? "bg-white/40 dark:bg-[#161233]/40 border-slate-150 dark:border-[#221c4e]/50 opacity-70" 
                    : "bg-white dark:bg-[#161233] border-slate-200 dark:border-[#221c4e] hover:border-violet-300 dark:hover:border-violet-850"
                )}
              >
                <CardContent className="p-4 flex gap-4">
                  <div className={cn(
                    "h-10 w-10 shrink-0 rounded-full flex items-center justify-center shadow-inner",
                    notif.type === 'alert' ? "bg-red-50 dark:bg-red-950/30 text-red-550 dark:text-red-400" :
                    notif.type === 'success' ? "bg-green-50 dark:bg-green-950/30 text-green-550 dark:text-green-400" :
                    "bg-blue-50 dark:bg-blue-950/30 text-blue-550 dark:text-blue-400"
                  )}>
                    <Bell className="h-5 w-5" />
                  </div>
                  <div className="space-y-1 w-full">
                    <div className="flex justify-between items-start w-full gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {!notif.isRead && (
                          <span className="h-2.5 w-2.5 rounded-full bg-blue-500 self-center shrink-0" />
                        )}
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{notif.title}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap font-medium">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{notif.message}</p>
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
