import React from "react";
import { motion } from "framer-motion";
import { Video, Phone, MessageCircle, Shield, Clock, XCircle, CheckCircle } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCountdown } from "@/hooks/use-countdown";
import type { IncomingRequest } from "@/hooks/use-socket";

function SessionTypeIcon({ type }: { type: string }) {
  if (type === "video") return <Video size={16} className="text-purple-400" />;
  if (type === "audio") return <Phone size={16} className="text-green-400" />;
  return <MessageCircle size={16} className="text-cyan-400" />;
}

export function IncomingRequestPopup({
  request,
  onAccept,
  onDecline,
  accepting,
}: {
  request: IncomingRequest;
  onAccept: () => void;
  onDecline: () => void;
  accepting: boolean;
}) {
  const [secondsLeft, setSecondsLeft] = React.useState(15);
  React.useEffect(() => {
    const id = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const declinedRef = React.useRef(false);
  React.useEffect(() => {
    if (secondsLeft <= 0 && !declinedRef.current) {
      declinedRef.current = true;
      onDecline();
    }
  }, [secondsLeft, onDecline]);

  const isUrgent = secondsLeft <= 10;
  const formatted = `0m ${secondsLeft.toString().padStart(2, "0")}s`;

  const sessionTypeLabel =
    request.sessionType === "video" ? "Video Call" : request.sessionType === "audio" ? "Audio Call" : "Chat Session";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 40 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, y: 40 }}
      transition={{ type: "spring", damping: 22, stiffness: 320 }}
      className="fixed inset-0 z-[999] flex items-center justify-center px-4"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

      <div className="relative w-full max-w-sm">
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10">
          <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 text-black text-[10px] font-black tracking-widest uppercase shadow-lg">
            New Doubt Request
          </div>
        </div>

        <div
          className={cn(
            "rounded-[2.5rem] border bg-[#0d1b2e] p-6 shadow-2xl flex flex-col gap-5",
            isUrgent ? "border-red-500/50 shadow-red-500/20" : "border-cyan-500/30 shadow-cyan-500/10"
          )}
        >
          <div
            className={cn(
              "absolute inset-0 rounded-[2.5rem] opacity-40 pointer-events-none",
              isUrgent ? "shadow-[0_0_40px_rgba(239,68,68,0.4)]" : "shadow-[0_0_40px_rgba(6,182,212,0.3)]"
            )}
          />

          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-14 w-14 border-2 border-white/10 shadow-xl">
                <AvatarImage src={request.student.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.student.name}`} />
                <AvatarFallback className="bg-zinc-800 text-white text-lg font-black">
                  {request.student.name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-[#0d1b2e] border border-white/10 flex items-center justify-center">
                <SessionTypeIcon type={request.sessionType} />
              </div>
            </div>
            <div>
              <p className="text-base font-black text-white leading-none">{request.student.name}</p>
              <p className="text-xs text-white/50 mt-0.5">
                Class {request.student.class} · {sessionTypeLabel}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <Shield size={10} className="text-cyan-400" />
                <span className="text-[10px] text-cyan-400 font-bold">Verified Student</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white/[0.04] border border-white/5 p-4 space-y-1.5">
            <p className="text-xs font-black text-white/90 leading-snug">
              {request.subject}{request.topic ? ` · ${request.topic}` : ""}
            </p>
            {request.doubtText && (
              <p className="text-[11px] text-white/50 leading-relaxed line-clamp-3">
                {request.doubtText}
              </p>
            )}
            {request.doubtImage && (
              <div className="mt-2 rounded-xl overflow-hidden border border-white/10 bg-black/40">
                <img
                  src={request.doubtImage}
                  alt="Doubt attachment"
                  className="w-full h-32 object-cover cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => window.open(request.doubtImage, "_blank")}
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/5 rounded-full px-3 py-1.5">
              <span className="text-[10px] font-black text-emerald-400">₹{request.ratePerMinute || 10}/min</span>
            </div>

            <div
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 border",
                isUrgent ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-orange-500/10 border-orange-500/30 text-orange-400"
              )}
            >
              <Clock size={12} />
              <span className="text-[10px] font-black tracking-wider">
                Expires: {formatted}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 z-10 relative">
            <Button
              onClick={onDecline}
              disabled={accepting}
              className="h-12 rounded-2xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 font-bold text-xs tracking-widest uppercase"
            >
              <XCircle size={16} className="mr-1.5" /> Decline
            </Button>
            <Button
              onClick={onAccept}
              disabled={accepting}
              className="h-12 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs tracking-widest uppercase shadow-lg"
            >
              {accepting ? <span className="animate-pulse">Connecting…</span> : <><CheckCircle size={16} className="mr-1.5" /> Accept</>}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
