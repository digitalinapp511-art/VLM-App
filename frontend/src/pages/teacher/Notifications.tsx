import React from "react";
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
  ChevronLeft
} from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import NotificationCard from "@/components/basic/teacher/NotificationCard";

const Notifications: React.FC = () => {
  const navigate = useNavigate();

  const notificationData = [
    {
      icon: Tv,
      title: "[Live Class Reminder]",
      message: "Live Class Starting Soon! Advanced Algebra starts in 15 minutes.",
      time: "5m ago",
      isUnread: true,
      actionText: "Join Class"
    },
    {
      icon: Wallet,
      title: "[Wallet Credit]",
      message: "Wallet Credited (+ ₹5,000) for session payment: 'Quantum Mechanics 101'.",
      time: "1h ago",
      isUnread: true,
      actionText: "Check Balance"
    },
    {
      icon: Users,
      title: "[New Request]",
      message: "New Student Join Request: Sarah J. wants to join your class.",
      time: "2h ago",
      isUnread: true,
      actionText: "Review"
    },
    {
      icon: Calendar,
      title: "[Withdrawal Update]",
      message: "Withdrawal Processed: ₹20,000 is now being processed by the bank.",
      time: "3h ago",
      isUnread: true,
      actionText: "Track Status"
    },
    {
      icon: MessageSquareText,
      title: "[Student Feedback]",
      message: "New Student Feedback Received! Check comments for 'Linear Algebra'.",
      time: "4h ago",
      isUnread: true,
      actionText: "Read Feedback"
    },
    {
      icon: Gift,
      title: "[Referral Reward]",
      message: "Referral Milestone Reached! 5 new teachers joined via your link.",
      time: "Yesterday",
      actionText: "View Rewards"
    },
    {
      icon: ClipboardList,
      title: "[Interview Reminder]",
      message: "Upcoming Interview Reminder: Tomorrow at 10:00 AM PST for Faculty role.",
      time: "Yesterday",
      actionText: "Prepare"
    },
    {
      icon: Sun,
      title: "[Admin Announcement]",
      message: "System Maintenance Notice: VLM platforms offline on Oct 28th for 4 hours.",
      time: "2 days ago",
      actionText: "Learn More"
    }
  ];

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
          Unread (5)
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
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.05 } }
          }}
          className="flex flex-col gap-4 pb-12"
        >
          {notificationData.map((notif, index) => (
            <NotificationCard 
              key={index}
              {...notif}
              onAction={() => console.log(`Action for: ${notif.title}`)}
            />
          ))}
        </motion.div>
      </ScrollArea>

      {/* Background Decorative Accents */}
      <div className="absolute top-1/4 -right-10 w-48 h-48 bg-cyan-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -left-10 w-48 h-48 bg-purple-500/5 blur-[120px] pointer-events-none" />
    </div>
  );
};

export default Notifications;