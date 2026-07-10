import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Tv, 
  Wallet, 
  Users, 
  Calendar, 
  MessageSquareText, 
  Gift, 
  ClipboardList, 
  Sun,
  Bell,
  ChevronLeft,
  Loader2
} from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import NotificationCard from "@/components/basic/teacher/NotificationCard";
import { teacherApi } from "@/lib/teacher-api";
import { toast } from "sonner";

interface ServerNotification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const getIconForType = (type: string) => {
  const t = (type || "").toLowerCase();
  if (t.includes("class")) return Tv;
  if (t.includes("wallet") || t.includes("earnings") || t.includes("pay")) return Wallet;
  if (t.includes("session") || t.includes("request")) return Users;
  if (t.includes("withdraw")) return Calendar;
  if (t.includes("feedback")) return MessageSquareText;
  if (t.includes("referral")) return Gift;
  return Bell;
};

const formatRelativeTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return "Yesterday";
  return `${diffDay} days ago`;
};

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<ServerNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await teacherApi.getNotifications();
      if (res.success && Array.isArray(res.data)) {
        setNotifications(res.data);
      }
    } catch (err: any) {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await teacherApi.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err: any) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className={cn("min-h-screen flex flex-col p-4 md:p-8 relative overflow-hidden", bgCss)}>
      
      {/* Header Bar */}
      <header className="w-full max-w-xl mx-auto flex items-center justify-between mb-6 px-2">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-zinc-400 hover:text-white transition-colors"
        >
          <ChevronLeft size={28} />
        </button>
        <span className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest">
          {loading ? "Loading..." : `Unread (${unreadCount})`}
        </span>
      </header>

      {/* Title */}
      <div className="w-full max-w-xl mx-auto mb-8 px-2">
        <h1 className="text-3xl font-black text-white uppercase tracking-tight">
          Notifications
        </h1>
      </div>

      {/* Scrollable List */}
      <ScrollArea className="flex-1 w-full max-w-xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 size={32} className="text-cyan-500 animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center text-zinc-500 py-12 text-sm">
            No notifications yet.
          </div>
        ) : (
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.05 } }
            }}
            className="flex flex-col gap-4 pb-12"
          >
            {notifications.map((notif) => (
              <NotificationCard 
                key={notif._id}
                icon={getIconForType(notif.type)}
                title={notif.title}
                message={notif.message}
                time={formatRelativeTime(notif.createdAt)}
                isUnread={!notif.isRead}
                actionText={!notif.isRead ? "Mark Read" : undefined}
                onAction={() => handleMarkRead(notif._id)}
              />
            ))}
          </motion.div>
        )}
      </ScrollArea>

      {/* Background Decorative Accents */}
      <div className="absolute top-1/4 -right-10 w-48 h-48 bg-cyan-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -left-10 w-48 h-48 bg-purple-500/5 blur-[120px] pointer-events-none" />
    </div>
  );
};

export default Notifications;