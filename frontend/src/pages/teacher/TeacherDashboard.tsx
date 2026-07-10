import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, AlertTriangle, Star, Phone, Video, MessageCircle, Shield, Clock, X, CheckCircle, XCircle } from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";

import StatCard from "@/components/basic/teacher/StatCard";
import { LiveClassItem, ReviewCard, ReferralCard } from "@/components/basic/teacher/Dashboards";
import { useSocket, type IncomingRequest } from "@/hooks/use-socket";
import { teacherApi } from "@/lib/teacher-api";
import { connectSocket, getSocket } from "@/lib/socket";

// ── Countdown Timer Hook ──────────────────────────────────────────────────────
function useCountdown(expiresAt: string | null) {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!expiresAt) return;
    const calc = () => Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
    setSecondsLeft(calc());
    const id = setInterval(() => {
      const left = calc();
      setSecondsLeft(left);
      if (left <= 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  const m = Math.floor(secondsLeft / 60);
  const s = secondsLeft % 60;
  return { secondsLeft, formatted: `${m}m ${s.toString().padStart(2, "0")}s` };
}

// ── Session type icons ────────────────────────────────────────────────────────
function SessionTypeIcon({ type }: { type: string }) {
  if (type === "video") return <Video size={16} className="text-purple-400" />;
  if (type === "audio") return <Phone size={16} className="text-green-400" />;
  return <MessageCircle size={16} className="text-cyan-400" />;
}

// ── Incoming Request Popup ────────────────────────────────────────────────────
function IncomingRequestPopup({
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
  const [secondsLeft, setSecondsLeft] = useState(15);
  useEffect(() => {
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

  const declinedRef = useRef(false);
  useEffect(() => {
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
      {/* Dark backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

      {/* Card */}
      <div className="relative w-full max-w-sm">
        {/* Top badge */}
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10">
          <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 text-black text-[10px] font-black tracking-widest uppercase shadow-lg">
            New Doubt Request
          </div>
        </div>

        {/* Main card */}
        <div
          className={cn(
            "rounded-[2.5rem] border bg-[#0d1b2e] p-6 shadow-2xl flex flex-col gap-5",
            isUrgent
              ? "border-red-500/50 shadow-red-500/20"
              : "border-cyan-500/30 shadow-cyan-500/10"
          )}
        >
          {/* Glowing animated border ring */}
          <div
            className={cn(
              "absolute inset-0 rounded-[2.5rem] opacity-40 pointer-events-none",
              isUrgent
                ? "shadow-[0_0_40px_rgba(239,68,68,0.4)]"
                : "shadow-[0_0_40px_rgba(6,182,212,0.3)]"
            )}
          />

          {/* Student Info */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-14 w-14 border-2 border-white/10 shadow-xl">
                <AvatarImage
                  src={
                    request.student.photo ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.student.name}`
                  }
                />
                <AvatarFallback className="bg-zinc-800 text-white text-lg font-black">
                  {request.student.name?.[0]}
                </AvatarFallback>
              </Avatar>
              {/* Session type icon badge */}
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

          {/* Doubt Content */}
          <div className="rounded-2xl bg-white/[0.04] border border-white/5 p-4 space-y-1">
            <p className="text-xs font-black text-white/90 leading-snug">
              {request.subject}
              {request.topic ? ` · ${request.topic}` : ""}
            </p>
            {request.doubtText && (
              <p className="text-[11px] text-white/50 leading-relaxed line-clamp-3">
                {request.doubtText}
              </p>
            )}
          </div>

          {/* Timer + Rate Row */}
          <div className="flex items-center justify-between">
            {/* Session rate */}
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/5 rounded-full px-3 py-1.5">
              <span className="text-[10px] font-black text-emerald-400">₹{request.ratePerMinute || 10}/min</span>
            </div>

            {/* Countdown */}
            <div
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 border",
                isUrgent
                  ? "bg-red-500/10 border-red-500/30 text-red-400"
                  : "bg-orange-500/10 border-orange-500/30 text-orange-400"
              )}
            >
              <Clock size={12} />
              <span className="text-[10px] font-black tracking-wider">
                Expires: {formatted}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={onDecline}
              disabled={accepting}
              className="h-12 rounded-2xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 font-bold text-xs tracking-widest uppercase"
            >
              <XCircle size={16} className="mr-1.5" />
              Decline
            </Button>
            <Button
              onClick={onAccept}
              disabled={accepting}
              className="h-12 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs tracking-widest uppercase shadow-lg"
            >
              {accepting ? (
                <span className="animate-pulse">Connecting…</span>
              ) : (
                <>
                  <CheckCircle size={16} className="mr-1.5" />
                  Accept
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Teacher Dashboard ────────────────────────────────────────────────────

const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [accepting, setAccepting] = useState(false);

  // Connect socket on mount + listen for incoming requests
  const { incomingRequest, dismissIncomingRequest } = useSocket({ autoConnect: true });

  // Emit teacher_online on mount — wait for socket connection first
  useEffect(() => {
    connectSocket();
    const s = getSocket();
    if (!s) return;

    const emitOnline = () => s.emit("teacher_online");

    if (s.connected) {
      emitOnline();
    } else {
      s.once("connect", emitOnline);
    }

    return () => {
      s.off("connect", emitOnline);
      // NOTE: Do NOT emit teacher_offline here — navigating away from the
      // dashboard to other teacher pages should NOT change the availability.
      // Presence is managed by DB status + socket auto-restore on reconnect.
    };
  }, []);

  const handleAccept = async () => {
    if (!incomingRequest) return;
    setAccepting(true);
    try {
      const result = await teacherApi.acceptDoubtRequest(incomingRequest.requestId);
      dismissIncomingRequest();
      toast.success("Request accepted! Starting session…");

      const sessionId = result?.data?.sessionId;
      if (sessionId) {
        if (incomingRequest.sessionType === "video") {
          navigate(PATHS.TEACHER_VIDEO_SESSION, {
            state: { sessionId, agoraChannel: result?.data?.agoraChannel, sessionType: "video", student: incomingRequest.student }
          });
        } else if (incomingRequest.sessionType === "audio") {
          navigate(PATHS.TEACHER_AUDIO_SESSION, {
            state: { sessionId, agoraChannel: result?.data?.agoraChannel, sessionType: "audio", student: incomingRequest.student }
          });
        } else {
          navigate(PATHS.TEACHER_CHAT_SESSION, {
            state: { sessionId, student: incomingRequest.student, requestId: incomingRequest.requestId }
          });
        }
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to accept request");
      setAccepting(false);
    }
  };

  const handleDecline = async () => {
    if (!incomingRequest) return;
    try {
      await teacherApi.declineDoubtRequest(incomingRequest.requestId);
      dismissIncomingRequest();
      toast.info("Request declined");
    } catch {
      dismissIncomingRequest();
    }
  };

  return (
    <div className={cn("min-h-screen flex flex-col items-center bg-black p-4 pb-12", bgCss)}>

      {/* ── Incoming Request Popup ── */}
      <AnimatePresence>
        {incomingRequest && (
          <IncomingRequestPopup
            request={incomingRequest}
            onAccept={handleAccept}
            onDecline={handleDecline}
            accepting={accepting}
          />
        )}
      </AnimatePresence>

      <div className="w-full max-w-xl lg:max-w-4xl flex flex-col gap-6">

        {/* Header */}
        <header className="flex justify-between items-center py-4 px-2">
          <div className="space-y-0.5">
            <h1 className="text-xl font-black text-white leading-none tracking-tight">VLM Academy</h1>
            <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Teacher App</p>
          </div>
          <div className="relative">
            <Avatar className="w-12 h-12 border-2 border-white/10 shadow-xl">
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" />
              <AvatarFallback>SJ</AvatarFallback>
            </Avatar>
            {/* Online indicator */}
            <div className="absolute top-0 right-0 w-3 h-3 bg-cyan-400 rounded-full border-2 border-black animate-pulse" />
          </div>
        </header>

        <section className="mb-2">
          <h2 className="text-3xl font-black text-white tracking-tight">Welcome, Teacher Sarah</h2>
          <p className="text-xs text-white/40 mt-1">You are <span className="text-cyan-400 font-bold">Online</span> — students can send you requests</p>
        </section>

        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <StatCard title="Today's Earnings" value="₹1,250" trend="up" variant="cyan" />
          <StatCard title="Total Points" value="7,850 pts" variant="purple" />
          <StatCard title="Wallet Balance" value="₹10,400" variant="blue" />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard title="Total Sessions" value="145" subValue="Sessions" icon={MessageSquare} variant="cyan" />
          <StatCard title="Missed Requests" value="3" subValue="Requests" icon={AlertTriangle} variant="purple" />
        </div>

        {/* Rating */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-7 rounded-[32px] border border-white/5 bg-zinc-900/40 backdrop-blur-xl relative"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest leading-none">Rating</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-4xl font-black text-white tracking-tighter">4.9</h3>
                <span className="text-zinc-500 font-bold text-sm tracking-tight lowercase">out of 5</span>
              </div>
              <div className="flex gap-1 text-purple-400 mt-2">
                {[...Array(5)].map((_, i) => <Star key={i} size={18} fill={i < 4 ? "currentColor" : "none"} className={i === 4 ? "opacity-30" : ""} />)}
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-800/40 text-zinc-500">
              <MessageSquare size={24} />
            </div>
          </div>
        </motion.div>

        {/* Main Body */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
          <section className="space-y-5">
            <h3 className="text-lg font-black text-white uppercase tracking-wider px-1">Upcoming Live Classes</h3>
            <div className="flex flex-col gap-3">
              <LiveClassItem title="Advanced Calculus" time="11:00 AM" />
              <LiveClassItem title="Advanced Forms" time="11:00 AM" />
            </div>
          </section>

          <section className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-black text-white uppercase tracking-wider px-1">Recent Reviews</h3>
              <ReviewCard />
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-black text-white uppercase tracking-wider px-1">Refer and Earn</h3>
              <ReferralCard />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;