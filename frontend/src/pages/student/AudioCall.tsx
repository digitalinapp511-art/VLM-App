import { bgCss } from "@/helper/CssHelper";

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { ChevronLeft, Mic, Volume2, PhoneOff, MicOff, VolumeX } from "lucide-react";
import ControlAction from "@/components/basic/student/ControlActions";
import { useQuery } from "@tanstack/react-query";
import { studentApi } from "@/lib/student-api";
import LoadingSkeleton from "@/components/basic/student/LoadingSkeleton";

// Official Shadcn Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export default function AudioCall() {
    const navigate = useNavigate();
    const location = useLocation();
    const doubtId = (location.state as { doubtId?: string })?.doubtId;
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeaker, setIsSpeaker] = useState(true);

    const { data: doubt, isLoading } = useQuery({
        queryKey: ["doubtForCall", doubtId],
        queryFn: () => doubtId ? studentApi.getDoubtById(doubtId) : null,
        enabled: !!doubtId,
    });

    if (isLoading) return <LoadingSkeleton />;

    const teacherName = doubt?.teacher?.fullName ?? "Your Teacher";
    const teacherDept = doubt?.teacher?.qualification ?? "Faculty";
    const topic = doubt?.text ?? doubt?.subject?.name ?? "Doubt Session";
    const avatarSeed = doubt?.teacher?.fullName ?? "teacher";

    return (
        <div className={`${bgCss}bg-linear-to-br/srgb max-w-xl m-auto relative flex min-h-svh w-full flex-col items-center bg-[#050505] px-6 pt-10 overflow-hidden text-white`}>

            <div className="absolute top-[20%] left-[-10%] h-[300px] w-[300px] bg-cyan-900/10 blur-[100px]" />
            <div className="absolute bottom-[10%] right-[-10%] h-[300px] w-[300px] bg-purple-900/10 blur-[100px]" />

            <header className="relative z-10 flex w-full items-center justify-between">
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-white/10 bg-white/5 text-white backdrop-blur-md" onClick={() => navigate(PATHS.ASK_DOUBT)}>
                    <ChevronLeft size={24} />
                </Button>
                <h1 className="text-xl font-bold tracking-tight">Audio Class</h1>
                <div className="w-12" />
            </header>

            <div className="relative z-10 mt-15 w-full max-w-[360px]">
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-20">
                    <Avatar className="h-24 w-24 border-4 border-[#0a0a0a] ring-2 ring-cyan-500/50 shadow-2xl">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`} />
                        <AvatarFallback>SK</AvatarFallback>
                    </Avatar>
                </div>

                <Card className="border-[#00f2ff]/40 bg-[#111]/60 backdrop-blur-3xl rounded-[2.5rem] pt-16 pb-8 shadow-[0_0_30px_rgba(0,242,255,0.05)]">
                    <CardContent className="flex flex-col items-center text-center space-y-2">
                        <h2 className="text-xl font-bold text-white tracking-tight">{teacherName}</h2>
                        <p className="text-lg font-medium text-white/90">{teacherDept}</p>
                        <p className="text-xs text-white/40 font-medium">Educator, VLM Academy</p>

                        <div className="w-full py-4 px-6">
                            <Separator className="bg-white/10" />
                        </div>

                        <p className="text-xs text-white/40 tracking-wide">
                            {topic}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="relative z-10 m-10 flex flex-col items-center space-y-6">
                <div className="space-y-1 text-center">
                    <p className="text-xs font-bold tracking-[0.2em] text-white/40 uppercase">Recording Active</p>
                    <h3 className="text-4xl font-black tracking-wider text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                        00:00
                    </h3>
                </div>

                <div className="h-20 w-full max-w-[280px]">
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

            <Card className="relative z-10 mb-8 w-full max-w-[380px] border-white/5 bg-[#1a1a1a]/40 backdrop-blur-2xl rounded-[2.5rem] py-6 shadow-2xl">
                <CardContent className="flex items-center justify-around p-0">

                    <ControlAction
                        icon={isMuted ? <MicOff /> : <Mic />}
                        label="Mute"
                        active={!isMuted}
                        variant="cyan"
                        onClick={() => setIsMuted(!isMuted)}
                    />

                    <ControlAction
                        icon={isSpeaker ? <Volume2 /> : <VolumeX />}
                        label="Speaker"
                        active={isSpeaker}
                        variant="cyan"
                        onClick={() => setIsSpeaker(!isSpeaker)}
                    />

                    <ControlAction
                        icon={<PhoneOff />}
                        label="End Call"
                        active
                        variant="red"
                        onClick={() => navigate(PATHS.SESSION_FEEDBACK, { state: { doubtId } })}
                    />

                </CardContent>
            </Card>
        </div>
    );
}
