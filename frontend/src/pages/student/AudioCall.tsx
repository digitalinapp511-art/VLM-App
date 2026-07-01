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
    const doubtId = (location.state as { doubtId?: string })?.doubtId;
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

    const teacherName = doubt?.teacher?.fullName ?? "Dr. S. K. Sharma";
    const teacherDept = doubt?.teacher?.qualification ?? "Math Dept";
    const topic = doubt?.text ?? doubt?.subject?.name ?? "JEE Mains - Calculus Doubt Session";
    const avatarSeed = doubt?.teacher?.fullName ?? "Dr. S. K. Sharma";

    const formatTimer = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const confirmEndCall = () => {
        navigate(PATHS.SESSION_FEEDBACK, { state: { doubtId } });
    };

    return (
        <div className={cn("relative h-svh w-full text-white flex flex-col items-center overflow-hidden", bgCss)}>

            {/* Background Decor Glows */}
            <div className="absolute top-[20%] left-[-15%] h-[280px] w-[280px] bg-cyan-900/10 blur-[90px] pointer-events-none" />
            <div className="absolute bottom-[10%] right-[-15%] h-[280px] w-[280px] bg-purple-900/10 blur-[90px] pointer-events-none" />

            {/* Main Flex Wrapper constrained to mobile layout height */}
            <div className="w-full max-w-md flex-1 flex flex-col justify-between h-full px-6 pt-6 pb-6 z-10 overflow-hidden">

                {/* ── HEADER ── */}
                <header className="relative flex w-full items-center justify-between shrink-0">
                    <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-10 w-10 rounded-xl border-white/10 bg-white/5 text-white backdrop-blur-md" 
                        onClick={() => setShowExitModal(true)}
                    >
                        <ChevronLeft size={20} />
                    </Button>
                    <h1 className="text-sm font-bold tracking-tight text-white/90">Audio Class</h1>
                    <div className="w-10" />
                </header>

                {/* ── TEACHER CARD BLOCK (Vertically Spaced) ── */}
                <div className="relative w-full max-w-[340px] mx-auto mt-12 mb-4 shrink-0">
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-20">
                        <Avatar className="h-20 w-20 border-4 border-[#050505] ring-2 ring-cyan-500/50 shadow-2xl">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`} />
                            <AvatarFallback>SK</AvatarFallback>
                        </Avatar>
                    </div>

                    <Card className="border-[#00f2ff]/30 bg-[#111]/70 backdrop-blur-3xl rounded-[2rem] pt-14 pb-6 shadow-[0_0_30px_rgba(0,242,255,0.04)]">
                        <CardContent className="flex flex-col items-center text-center space-y-1.5 p-4">
                            <h2 className="text-base font-bold text-white tracking-wide">{teacherName}</h2>
                            <p className="text-xs font-semibold text-white/90">{teacherDept}</p>
                            <p className="text-[10px] text-white/40 font-medium uppercase tracking-wider">Math Educator, VLM Academy</p>

                            <div className="w-full py-2.5 px-4">
                                <Separator className="bg-white/5" />
                            </div>

                            <p className="text-[11px] text-white/40 tracking-wide font-medium leading-relaxed">
                                {topic}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* ── WAVEFORM & TIMER BLOCK ── */}
                <div className="flex-1 flex flex-col items-center justify-center min-h-[140px] shrink-0">
                    <div className="space-y-0.5 text-center mb-1">
                        <p className="text-[9px] font-bold tracking-[0.2em] text-white/40 uppercase">Recording Active</p>
                        <h3 className="text-3xl font-black tracking-wider text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.25)]">
                            {formatTimer(secondsElapsed)}
                        </h3>
                    </div>

                    <div className="h-16 w-full max-w-[240px]">
                        <svg viewBox="0 0 200 60" className="w-full h-full opacity-60">
                            <path
                                d="M0 30 Q 25 10, 50 30 T 100 30 T 150 30 T 200 30"
                                fill="none"
                                stroke="#00f2ff"
                                strokeWidth="2"
                                className="animate-pulse"
                            />
                            <path
                                d="M0 40 Q 30 20, 60 40 T 120 40 T 180 40"
                                fill="none"
                                stroke="#a855f7"
                                strokeWidth="2"
                                className="animate-pulse"
                                style={{ animationDelay: '0.5s' }}
                            />
                        </svg>
                    </div>
                </div>

                {/* ── ACTION CONTROLS PANEL ── */}
                <Card className="w-full max-w-[360px] mx-auto border-white/5 bg-[#1a1a1a]/40 backdrop-blur-2xl rounded-[2rem] py-4 shadow-2xl shrink-0">
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-lg p-6">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-xs rounded-[2.5rem] border border-red-500/35 bg-white/[0.03] backdrop-blur-3xl p-8 text-center shadow-[0_0_40px_rgba(239,68,68,0.15)] flex flex-col items-center gap-6"
                        >
                            <div className="h-16 w-16 rounded-full bg-cyan-950/40 flex items-center justify-center text-cyan-400 border border-cyan-500/20 text-2xl shadow-inner">
                                ⭐
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-white leading-snug">
                                    Are you sure you want to end this call?
                                </h3>
                            </div>

                            <div className="flex flex-col gap-3 w-full">
                                <Button
                                    onClick={() => setShowExitModal(false)}
                                    className="w-full h-12 rounded-full font-bold text-sm bg-white text-black hover:bg-white/90 border-none transition-all flex items-center justify-center gap-1.5"
                                >
                                    ✓ CANCEL
                                </Button>
                                <Button
                                    onClick={confirmEndCall}
                                    className="w-full h-12 rounded-full font-bold text-sm bg-gradient-to-b from-red-600 to-red-900 hover:from-red-500 hover:to-red-800 text-white border border-red-400/20 shadow-[0_0_15px_rgba(239,68,68,0.3)] active:scale-95 transition-all flex items-center justify-center gap-1.5"
                                >
                                    ➜ END CALL
                                </Button>
                            </div>

                            <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
                                We priority match your review
                            </p>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}
