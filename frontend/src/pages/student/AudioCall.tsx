import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { ChevronLeft, Mic, Volume2, PhoneOff, MicOff, VolumeX } from "lucide-react";
import ControlAction from "@/components/basic/student/ControlActions";
import { useQuery } from "@tanstack/react-query";
import { studentApi } from "@/lib/student-api";
import LoadingSkeleton from "@/components/basic/student/LoadingSkeleton";
import { motion, AnimatePresence } from "framer-motion";
import { bgCss } from "@/helper/CssHelper";

// Official Shadcn Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export default function AudioCall() {
    const navigate = useNavigate();
    const location = useLocation();
    const { doubtId, teacher, subjectName } = (location.state as { doubtId?: string; teacher?: { name?: string; photo?: string }; subjectName?: string }) ?? {};
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeaker, setIsSpeaker] = useState(true);
    const [showExitModal, setShowExitModal] = useState(false);
    const [secondsElapsed, setSecondsElapsed] = useState(0);

    const { data: doubt, isLoading } = useQuery({
        queryKey: ["doubtForCall", doubtId],
        queryFn: () => doubtId ? studentApi.getDoubtById(doubtId) : null,
        enabled: !!doubtId,
    });

    // Run active call timer
    useEffect(() => {
        const interval = setInterval(() => {
            setSecondsElapsed(prev => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    if (isLoading) return <LoadingSkeleton />;

    const teacherName = doubt?.teacher?.fullName ?? teacher?.name ?? "Dr. S. K. Sharma";
    const teacherDept = doubt?.teacher?.qualification ?? subjectName ?? "Expert Educator";
    const topic = doubt?.text ?? doubt?.subject?.name ?? subjectName ?? "Doubt Session";
    const avatarSeed = doubt?.teacher?.fullName ?? teacher?.name ?? "Educator";

    const formatTimer = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const confirmEndCall = () => {
        navigate(PATHS.SESSION_FEEDBACK, { state: { doubtId } });
    };

    return (
        <div className="relative flex h-svh w-full flex-col items-center bg-[#f4f6ff] dark:bg-[#0b081e] text-slate-800 dark:text-slate-100 transition-colors duration-300 overflow-hidden">

            {/* Main Flex Wrapper constrained to mobile layout height */}
            <div className="w-full max-w-md flex-1 flex flex-col justify-between h-full px-6 pt-6 pb-6 z-10 overflow-hidden">

                {/* ── HEADER ── */}
                <header className="relative flex w-full items-center justify-between shrink-0">
                    <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-10 w-10 rounded-xl border-slate-200 dark:border-[#221c4e] bg-white dark:bg-[#161233] text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-95 transition-all shadow-sm" 
                        onClick={() => setShowExitModal(true)}
                    >
                        <ChevronLeft size={20} />
                    </Button>
                    <h1 className="text-sm font-black tracking-tight uppercase">Audio Class</h1>
                    <div className="w-10" />
                </header>

                {/* ── TEACHER CARD BLOCK (Vertically Spaced) ── */}
                <div className="relative w-full max-w-[340px] mx-auto mt-12 mb-4 shrink-0">
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-20">
                        <Avatar className="h-20 w-20 border-4 border-white dark:border-[#0b081e] ring-2 ring-violet-500/20 shadow-2xl">
                            <AvatarImage src={teacher?.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`} />
                            <AvatarFallback>SK</AvatarFallback>
                        </Avatar>
                    </div>

                    <Card className="border border-slate-100 dark:border-[#221c4e] bg-white dark:bg-[#161233] rounded-[2rem] pt-14 pb-6 shadow-sm">
                        <CardContent className="flex flex-col items-center text-center space-y-1.5 p-4">
                            <h2 className="text-base font-black text-slate-800 dark:text-white tracking-wide">{teacherName}</h2>
                            <p className="text-xs font-bold text-slate-650 dark:text-slate-300">{teacherDept}</p>
                            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                                Doubt ID: {doubtId ? doubtId.slice(-6).toUpperCase() : "#VLM-CALL"}
                            </p>

                            <div className="w-full py-2.5 px-4">
                                <Separator className="bg-slate-100 dark:bg-slate-900" />
                            </div>

                            <p className="text-[11px] text-slate-500 dark:text-slate-400 tracking-wide font-bold leading-relaxed">
                                {topic}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* ── WAVEFORM & TIMER BLOCK ── */}
                <div className="flex-1 flex flex-col items-center justify-center min-h-[140px] shrink-0">
                    <div className="space-y-0.5 text-center mb-1">
                        <p className="text-[9px] font-black tracking-[0.2em] text-slate-400 dark:text-slate-550 uppercase">Voice Connection Active</p>
                        <h3 className="text-3xl font-black tracking-wider text-slate-850 dark:text-white">
                            {formatTimer(secondsElapsed)}
                        </h3>
                    </div>

                    <div className="h-16 w-full max-w-[240px]">
                        <svg viewBox="0 0 200 60" className="w-full h-full opacity-60">
                            <path
                                d="M0 30 Q 25 10, 50 30 T 100 30 T 150 30 T 200 30"
                                fill="none"
                                stroke="#7c3aed"
                                strokeWidth="2.5"
                                className="animate-pulse"
                            />
                            <path
                                d="M0 40 Q 30 20, 60 40 T 120 40 T 180 40"
                                fill="none"
                                stroke="#db2777"
                                strokeWidth="2.5"
                                className="animate-pulse"
                                style={{ animationDelay: '0.5s' }}
                            />
                        </svg>
                    </div>
                </div>

                {/* ── ACTION CONTROLS PANEL ── */}
                <Card className="w-full max-w-[360px] mx-auto border border-slate-100 dark:border-[#221c4e] bg-white dark:bg-[#161233] rounded-[2rem] py-4 shadow-sm shrink-0">
                    <CardContent className="flex items-center justify-around p-0">

                        <ControlAction
                            icon={isMuted ? <MicOff size={18} /> : <Mic size={18} />}
                            label="Mute"
                            active={!isMuted}
                            variant="cyan"
                            onClick={() => setIsMuted(!isMuted)}
                        />

                        <ControlAction
                            icon={isSpeaker ? <Volume2 size={18} /> : <VolumeX size={18} />}
                            label="Speaker"
                            active={isSpeaker}
                            variant="cyan"
                            onClick={() => setIsSpeaker(!isSpeaker)}
                        />

                        <ControlAction
                            icon={<PhoneOff size={18} />}
                            label="End Call"
                            active
                            variant="red"
                            onClick={() => setShowExitModal(true)}
                        />

                    </CardContent>
                </Card>

            </div>

            {/* ── EXIT CONFIRMATION POPUP ── */}
            <AnimatePresence>
                {showExitModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-xs rounded-[2.5rem] border border-slate-100 dark:border-[#221c4e] bg-white dark:bg-[#161233] p-8 text-center shadow-2xl flex flex-col items-center gap-6 text-slate-800 dark:text-slate-100"
                        >
                            <div className="h-16 w-16 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-yellow-500 text-2xl shadow-inner">
                                ⭐
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-base font-black leading-snug uppercase tracking-tight">
                                    End Call Session?
                                </h3>
                            </div>

                            <div className="flex flex-col gap-3 w-full">
                                <Button
                                    onClick={() => setShowExitModal(false)}
                                    className="w-full h-12 rounded-xl font-bold text-xs uppercase tracking-wider bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-850 border-none transition-all"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={confirmEndCall}
                                    className="w-full h-12 rounded-xl font-black text-xs uppercase tracking-wider bg-rose-600 hover:bg-rose-500 text-white border-none shadow-md shadow-rose-500/20 active:scale-95 transition-all"
                                >
                                    End Call
                                </Button>
                            </div>

                            <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">
                                We priority match your review
                            </p>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}
