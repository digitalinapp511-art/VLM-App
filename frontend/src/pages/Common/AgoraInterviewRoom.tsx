import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Video, Mic, MicOff, VideoOff, PhoneOff, ShieldCheck, UserCheck, Loader2 } from 'lucide-react';
import { bgCss } from '@/helper/CssHelper';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { teacherApi } from '@/lib/teacher-api';
import { toast } from 'sonner';

const AgoraInterviewRoom: React.FC = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const navigate = useNavigate();

  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [joined, setJoined] = useState(false);
  const [remoteJoined, setRemoteJoined] = useState(false);

  const localVideoRef = React.useRef<HTMLDivElement>(null);
  const remoteVideoRef = React.useRef<HTMLDivElement>(null);

  const agoraClientRef = React.useRef<any>(null);
  const localTrackRef = React.useRef<any[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ['interviewAgoraToken', interviewId],
    queryFn: () => teacherApi.getInterviewAgoraToken(interviewId || ''),
    enabled: !!interviewId,
  });

  const handleJoinCall = async () => {
    if (!data?.appId || !data?.channelName || !data?.agoraToken) {
      toast.error("Agora credentials not ready yet");
      return;
    }

    try {
      const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
      const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      agoraClientRef.current = client;

      client.on("user-published", async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        setRemoteJoined(true);
        if (mediaType === "video" && remoteVideoRef.current) {
          user.videoTrack?.play(remoteVideoRef.current);
        }
        if (mediaType === "audio") {
          user.audioTrack?.play();
        }
      });

      client.on("user-left", () => setRemoteJoined(false));

      await client.join(data.appId, data.channelName, data.agoraToken, null);

      let audioTrack: any = null;
      let videoTrack: any = null;

      try {
        audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      } catch (e) {
        toast.error("Microphone access is required to join.");
      }

      try {
        videoTrack = await AgoraRTC.createCameraVideoTrack();
        if (localVideoRef.current) {
          videoTrack.play(localVideoRef.current);
        }
      } catch (e) {
        toast.error("Camera access failed. Continuing with audio only.");
      }

      const tracks: any[] = [];
      if (audioTrack) {
        tracks.push(audioTrack);
        localTrackRef.current.push(audioTrack);
      }
      if (videoTrack) {
        tracks.push(videoTrack);
        localTrackRef.current.push(videoTrack);
      }

      await client.publish(tracks);
      setJoined(true);
      toast.success("Joined interview call successfully!");
    } catch (err: any) {
      console.error("Agora join failed (teacher interview):", err);
      toast.error("Failed to join call: " + (err.message || String(err)));
    }
  };

  const handleLeaveCall = () => {
    localTrackRef.current.forEach((t) => { t.stop(); t.close(); });
    localTrackRef.current = [];
    if (agoraClientRef.current) {
      agoraClientRef.current.leave().catch(() => {});
    }
    agoraClientRef.current = null;
    setJoined(false);
    setRemoteJoined(false);
    navigate('/teacher/onboarding');
  };

  const toggleAudio = () => {
    const audioTrack = localTrackRef.current.find(t => t.trackMediaType === "audio" || t.getMediaStreamTrack()?.kind === "audio");
    if (audioTrack) {
      if (isAudioMuted) {
        audioTrack.setEnabled(true);
      } else {
        audioTrack.setEnabled(false);
      }
      setIsAudioMuted(!isAudioMuted);
    }
  };

  const toggleVideo = () => {
    const videoTrack = localTrackRef.current.find(t => t.trackMediaType === "video" || t.getMediaStreamTrack()?.kind === "video");
    if (videoTrack) {
      if (isVideoMuted) {
        videoTrack.setEnabled(true);
      } else {
        videoTrack.setEnabled(false);
      }
      setIsVideoMuted(!isVideoMuted);
    }
  };

  React.useEffect(() => {
    return () => {
      localTrackRef.current.forEach((t) => { t.stop(); t.close(); });
      localTrackRef.current = [];
      if (agoraClientRef.current) {
        agoraClientRef.current.leave().catch(() => {});
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className={cn('min-h-screen flex items-center justify-center text-white', bgCss)}>
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className={cn('min-h-screen flex flex-col items-center justify-between p-4 relative text-white', bgCss)}>
      {/* Top Bar */}
      <div className="w-full max-w-5xl flex items-center justify-between bg-white/5 border border-white/10 px-6 py-4 rounded-2xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <h2 className="font-bold text-sm sm:text-base">Teacher Verification Interview</h2>
            <p className="text-xs text-zinc-400 font-mono">Channel: {data?.channelName || 'agora_room'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 px-3 py-1.5 rounded-full font-semibold">
          <ShieldCheck size={14} /> Agora Encrypted Room
        </div>
      </div>

      {/* Main Video Layout */}
      <div className="w-full max-w-5xl flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
        {/* Remote Interviewer Video Feed */}
        <div ref={remoteVideoRef} className="relative bg-zinc-900/90 border border-white/10 rounded-3xl overflow-hidden flex flex-col items-center justify-center min-h-[260px] sm:min-h-[360px] shadow-2xl">
          {!remoteJoined && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/60 z-10">
              <div className="w-20 h-20 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center mb-3">
                <UserCheck size={36} />
              </div>
              <p className="font-bold text-sm">Admin / Lead Interviewer Feed</p>
              <p className="text-xs text-zinc-500 mt-1">
                Waiting for interviewer to connect...
              </p>
            </div>
          )}
        </div>

        {/* Local Teacher Video Feed */}
        <div ref={localVideoRef} className="relative bg-zinc-900/90 border border-white/10 rounded-3xl overflow-hidden flex flex-col items-center justify-center min-h-[260px] sm:min-h-[360px] shadow-2xl">
          {isVideoMuted && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/60 z-10">
              <VideoOff size={40} className="text-zinc-600 mb-2" />
              <p className="text-xs text-zinc-400">Camera is turned off</p>
            </div>
          )}
          {!joined && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/60 z-10">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center mb-3">
                <Video size={36} />
              </div>
              <p className="font-bold text-sm">Your Self Camera Feed</p>
              <p className="text-xs text-zinc-500 mt-1">Ready to join interview</p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Call Controls */}
      <div className="w-full max-w-md bg-white/10 border border-white/10 p-3 rounded-full backdrop-blur-xl flex items-center justify-center gap-4 shadow-2xl">
        <button
          onClick={toggleAudio}
          className={cn(
            'p-3.5 rounded-full transition border',
            isAudioMuted ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' : 'bg-white/10 border-white/10 text-white hover:bg-white/20'
          )}
        >
          {isAudioMuted ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        <button
          onClick={toggleVideo}
          className={cn(
            'p-3.5 rounded-full transition border',
            isVideoMuted ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' : 'bg-white/10 border-white/10 text-white hover:bg-white/20'
          )}
        >
          {isVideoMuted ? <VideoOff size={20} /> : <Video size={20} />}
        </button>

        {!joined ? (
          <Button
            onClick={handleJoinCall}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-full text-xs gap-2"
          >
            <Video size={16} /> Enter Agora Interview Call
          </Button>
        ) : (
          <Button
            onClick={handleLeaveCall}
            className="bg-rose-500 hover:bg-rose-600 text-white font-bold p-3.5 rounded-full"
          >
            <PhoneOff size={20} />
          </Button>
        )}
      </div>
    </div>
  );
};

export default AgoraInterviewRoom;
