import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Video, Mic, MicOff, VideoOff, PhoneOff, ShieldCheck,
  UserCheck, Loader2, MessageSquare, Send, Eraser, X
} from 'lucide-react';
import { bgCss } from '@/helper/CssHelper';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { teacherApi } from '@/lib/teacher-api';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

const AgoraInterviewRoom: React.FC = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const navigate = useNavigate();

  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [joined, setJoined] = useState(false);
  const [remoteJoined, setRemoteJoined] = useState(false);

  // Tab state for Video vs Whiteboard on the left side
  const [activeWorkspace, setActiveWorkspace] = useState<'video' | 'whiteboard'>('video');
  const [showChat, setShowChat] = useState(true);

  // Chat States
  const [messages, setMessages] = useState<Array<{ sender: string; text: string }>>([]);
  const [inputText, setInputText] = useState('');

  // Whiteboard drawing settings
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(4);
  const [isDrawing, setIsDrawing] = useState(false);

  // Refs for Agora
  const agoraClientRef = useRef<any>(null);
  const localTrackRef = useRef<any[]>([]);

  // Refs for Video Div elements
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);

  // Refs for Canvas Whiteboard
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const drawingHistoryRef = useRef<any[]>([]);

  // Sync state refs
  const lastPolledRef = useRef<number>(0);

  const { data, isLoading } = useQuery({
    queryKey: ['interviewAgoraToken', interviewId],
    queryFn: () => teacherApi.getInterviewAgoraToken(interviewId || ''),
    enabled: !!interviewId,
  });

  const [localVideoTrack, setLocalVideoTrack] = useState<any>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<any>(null);

  // Initialize camera and mic preview on the lobby page
  useEffect(() => {
    if (!data?.appId || joined) return;

    let active = true;
    const initLobbyTracks = async () => {
      try {
        const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
        
        let audioTrack = null;
        let videoTrack = null;
        
        try {
          audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        } catch (e) {
          console.warn("Lobby mic access failed:", e);
        }
        
        try {
          videoTrack = await AgoraRTC.createCameraVideoTrack();
        } catch (e) {
          console.warn("Lobby camera access failed:", e);
        }

        if (!active) {
          audioTrack?.close();
          videoTrack?.close();
          return;
        }

        // Clear any old/duplicate tracks
        localTrackRef.current.forEach(t => { try { t.stop(); t.close(); } catch(e){} });
        localTrackRef.current = [];

        if (audioTrack) {
          setLocalAudioTrack(audioTrack);
          localTrackRef.current.push(audioTrack);
        }
        if (videoTrack) {
          setLocalVideoTrack(videoTrack);
          localTrackRef.current.push(videoTrack);
          setTimeout(() => {
            try {
              if (localVideoRef.current && !isVideoMuted) {
                localVideoRef.current.innerHTML = "";
                videoTrack.play(localVideoRef.current);
              }
            } catch (e) {
              console.warn("Lobby video track play failed:", e);
            }
          }, 300);
        }
      } catch (err) {
        console.error("Lobby track initialization failed:", err);
      }
    };

    initLobbyTracks();

    return () => {
      active = false;
    };
  }, [data?.appId]);

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
        console.log("===== TEACHER REMOTE USER =====");
        await client.subscribe(user, mediaType);

        if (mediaType === "video") {
          setRemoteJoined(true);
          setTimeout(() => {
            try {
              if (remoteVideoRef.current) {
                remoteVideoRef.current.innerHTML = "";
                user.videoTrack?.play(remoteVideoRef.current);
              }
            } catch (e) {
              console.warn("Remote user video track play failed:", e);
            }
          }, 300);
        }

        if (mediaType === "audio") {
          try {
            user.audioTrack?.play();
          } catch (e) {
            console.warn("Remote user audio track play failed:", e);
          }
        }
      });

      client.on("user-left", () => {
        setRemoteJoined(false);
        setMessages(prev => [...prev, { sender: 'System', text: 'Admin / Interviewer left the session.' }]);
      });

      await client.join(data.appId, data.channelName, data.agoraToken, null);
      
      if (localTrackRef.current.length > 0) {
        await client.publish(localTrackRef.current);
      }
      
      setJoined(true);
      setMessages(prev => [...prev, { sender: 'System', text: 'Connected to call. Waiting for interviewer to join...' }]);
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
      agoraClientRef.current.leave().catch(() => { });
    }
    agoraClientRef.current = null;
    setJoined(false);
    setRemoteJoined(false);
    navigate('/verification-status');
  };

  const toggleAudio = async () => {
    try {
      const audioTrack = localTrackRef.current.find(t => t && t.trackMediaType === "audio");
      if (audioTrack) {
        await audioTrack.setEnabled(isAudioMuted);
        setIsAudioMuted(!isAudioMuted);
      }
    } catch (e) {
      console.error("Failed to toggle audio:", e);
    }
  };

  const toggleVideo = async () => {
    try {
      const videoTrack = localTrackRef.current.find(t => t && t.trackMediaType === "video");
      if (videoTrack) {
        await videoTrack.setEnabled(isVideoMuted);
        setIsVideoMuted(!isVideoMuted);
      }
    } catch (e) {
      console.error("Failed to toggle video:", e);
    }
  };

  // Poll loop for drawing and chat updates (REST syncing fallback)
  useEffect(() => {
    if (!interviewId) return;

    let active = true;
    const fetchSync = async () => {
      try {
        const { data: responseData } = await apiClient.get(`/auth/interview/${interviewId}/sync?since=${lastPolledRef.current}`);
        if (responseData.success && responseData.data && responseData.data.length > 0 && active) {
          let maxTime = lastPolledRef.current;
          responseData.data.forEach((event: any) => {
            maxTime = Math.max(maxTime, event.timestamp);

            // Skip drawing/chat events sent by the current sender ('candidate')
            if (event.sender === 'candidate') {
              return;
            }

            // Process remote/admin events
            if (event.type === 'chat') {
              setMessages(prev => [...prev, { sender: 'Admin / Interviewer', text: event.text }]);
            } else if (event.type === 'draw-start') {
              drawRemoteStart(event.x, event.y, event.color, event.size);
            } else if (event.type === 'draw-move') {
              drawRemoteMove(event.x, event.y);
            } else if (event.type === 'draw-end') {
              drawRemoteEnd();
            } else if (event.type === 'clear-board') {
              clearLocalBoard(false);
            }
          });
          lastPolledRef.current = maxTime;
        }
      } catch (e) {
        console.error('Error polling sync data:', e);
      }
    };

    const interval = setInterval(fetchSync, 700);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [interviewId]);

  const sendSyncEvent = async (eventPayload: any) => {
    if (!interviewId) return;
    try {
      await apiClient.post(`/auth/interview/${interviewId}/sync`, { event: eventPayload });
    } catch (e) {
      console.error('Error sending sync event:', e);
    }
  };

  const sendMessage = () => {
    if (!inputText.trim()) return;
    const text = inputText.trim();
    setMessages(prev => [...prev, { sender: 'You (Candidate)', text }]);
    setInputText('');
    sendSyncEvent({ type: 'chat', text });
  };

  // Canvas drawing initialize
  useEffect(() => {
    if (activeWorkspace === 'whiteboard' && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvas.parentElement?.clientWidth || 800;
      canvas.height = canvas.parentElement?.clientHeight || 500;

      const context = canvas.getContext('2d');
      if (context) {
        context.lineCap = 'round';
        context.lineJoin = 'round';
        contextRef.current = context;
      }

      redrawHistory();
    }
  }, [activeWorkspace]);

  const redrawHistory = () => {
    if (!contextRef.current || !canvasRef.current) return;
    const ctx = contextRef.current;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    drawingHistoryRef.current.forEach((stroke) => {
      if (stroke.points.length < 1) return;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size;
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    });
  };

  // Whiteboard drawing handlers (Local mouse interactions)
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    contextRef.current.strokeStyle = brushColor;
    contextRef.current.lineWidth = brushSize;
    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    setIsDrawing(true);

    drawingHistoryRef.current.push({
      color: brushColor,
      size: brushSize,
      points: [{ x, y }]
    });

    sendDrawEvent('draw-start', x, y, brushColor, brushSize);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !contextRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();

    const currentStroke = drawingHistoryRef.current[drawingHistoryRef.current.length - 1];
    if (currentStroke) {
      currentStroke.points.push({ x, y });
    }

    sendDrawEvent('draw-move', x, y);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    sendDrawEvent('draw-end');
  };

  // Whiteboard drawing handlers (Remote messages received)
  const remotePathRef = useRef<any>(null);

  const drawRemoteStart = (x: number, y: number, color: string, size: number) => {
    remotePathRef.current = {
      color,
      size,
      points: [{ x, y }]
    };

    if (!contextRef.current) return;
    contextRef.current.strokeStyle = color;
    contextRef.current.lineWidth = size;
    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
  };

  const drawRemoteMove = (x: number, y: number) => {
    if (remotePathRef.current) {
      remotePathRef.current.points.push({ x, y });
    }
    if (!contextRef.current) return;
    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
  };

  const drawRemoteEnd = () => {
    if (remotePathRef.current) {
      drawingHistoryRef.current.push(remotePathRef.current);
      remotePathRef.current = null;
    }
  };

  const clearLocalBoard = (notify = true) => {
    drawingHistoryRef.current = [];
    if (canvasRef.current && contextRef.current) {
      contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    if (notify) {
      sendDrawEvent('clear-board');
    }
  };

  const sendDrawEvent = (type: string, x = 0, y = 0, color = '', size = 0) => {
    sendSyncEvent({ type, x, y, color, size });
  };

  // Re-bind Agora video streams when switching workspaces/tabs
  useEffect(() => {
    try {
      const localTrack = localTrackRef.current.find(t => t.trackMediaType === "video" || t.getMediaStreamTrack()?.kind === "video");
      if (localTrack && localVideoRef.current && !isVideoMuted) {
        localVideoRef.current.innerHTML = "";
        localTrack.play(localVideoRef.current);
      }
    } catch (e) {
      console.warn("Local play failed:", e);
    }

    try {
      if (agoraClientRef.current) {
        const remoteUsers = agoraClientRef.current.remoteUsers;
        remoteUsers.forEach((user: any) => {
          if (user.videoTrack && remoteVideoRef.current) {
            remoteVideoRef.current.innerHTML = "";
            user.videoTrack.play(remoteVideoRef.current);
          }
        });
      }
    } catch (e) {
      console.warn("Remote play failed:", e);
    }
  }, [activeWorkspace, joined, remoteJoined, isVideoMuted]);

  React.useEffect(() => {
    return () => {
      localTrackRef.current.forEach((t) => { t.stop(); t.close(); });
      localTrackRef.current = [];
      if (agoraClientRef.current) {
        agoraClientRef.current.leave().catch(() => { });
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

  if (!joined) {
    return (
      <div className={cn('min-h-screen flex flex-col items-center justify-center p-6 relative text-white', bgCss)}>
        <div className="w-full max-w-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center">
          
          <h2 className="text-2xl font-extrabold tracking-tight mb-2">Ready to Join your Interview?</h2>
          <p className="text-sm text-zinc-400 mb-6 font-medium">Check your camera and microphone preview below before entering the live session.</p>

          {/* Large Camera Preview Card */}
          <div className="relative w-full aspect-video bg-black/45 rounded-2xl overflow-hidden border border-white/10 mb-6 shadow-inner flex items-center justify-center">
            <div ref={localVideoRef} className="absolute inset-0 w-full h-full object-cover" />
            
            {/* If camera is muted or loading */}
            {isVideoMuted && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/90 z-10">
                <VideoOff size={44} className="text-rose-500 mb-2" />
                <p className="text-sm text-zinc-400">Your camera is turned off</p>
              </div>
            )}

            {!localVideoTrack && !isVideoMuted && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/80 z-10">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mb-2" />
                <p className="text-sm text-zinc-400">Starting camera preview...</p>
              </div>
            )}

            {/* Float badge */}
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-md text-xs font-semibold border border-white/10 z-20">
              Camera Preview
            </div>
          </div>

          {/* Lobby Media Control Buttons */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={toggleAudio}
              className={cn(
                'w-12 h-12 rounded-full border transition-all flex items-center justify-center cursor-pointer',
                isAudioMuted ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' : 'bg-zinc-800 border-white/10 text-white hover:bg-zinc-700'
              )}
              title={isAudioMuted ? 'Unmute Mic' : 'Mute Mic'}
            >
              {isAudioMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            
            <button
              onClick={toggleVideo}
              className={cn(
                'w-12 h-12 rounded-full border transition-all flex items-center justify-center cursor-pointer',
                isVideoMuted ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' : 'bg-zinc-800 border-white/10 text-white hover:bg-zinc-700'
              )}
              title={isVideoMuted ? 'Turn Camera On' : 'Turn Camera Off'}
            >
              {isVideoMuted ? <VideoOff size={20} /> : <Video size={20} />}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="w-full flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleJoinCall}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold px-8 h-12 rounded-full text-sm gap-2 cursor-pointer shadow-lg shadow-emerald-500/10 min-w-[200px]"
            >
              <Video size={16} /> Join Interview Room
            </Button>
            <Button
              onClick={() => navigate('/verification-status')}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold px-8 h-12 rounded-full text-sm cursor-pointer border border-white/5"
            >
              Go Back
            </Button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className={cn('min-h-screen flex flex-col items-center justify-between relative text-white overflow-hidden', bgCss)}>

      {/* 1. ROOM HEADER */}
      <div className="w-full flex flex-row items-center justify-between bg-zinc-900 border-b border-white/10 px-4 py-3 gap-2 z-20 shrink-0">
        <div className="flex items-center gap-2">
          <div className={cn("w-2.5 h-2.5 rounded-full animate-pulse", joined ? "bg-emerald-400" : "bg-amber-400")} />
          <div>
            <h2 className="font-bold text-xs sm:text-base">VLM Live</h2>
            <p className="text-[9px] sm:text-xs text-zinc-400 font-mono max-w-[120px] sm:max-w-none truncate">
              {data?.channelName || 'agora_room'}
            </p>
          </div>
        </div>

        {/* Workspace controls */}
        {joined && (
          <div className="flex gap-0.5 bg-black/40 p-0.5 rounded-lg border border-white/10">
            <button
              onClick={() => setActiveWorkspace('video')}
              className={cn(
                "px-2 sm:px-4 py-1.5 rounded-md text-[10px] sm:text-xs font-semibold cursor-pointer transition-all",
                activeWorkspace === 'video' ? "bg-blue-500 text-white" : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              Video
            </button>
            <button
              onClick={() => setActiveWorkspace('whiteboard')}
              className={cn(
                "px-2 sm:px-4 py-1.5 rounded-md text-[10px] sm:text-xs font-semibold cursor-pointer transition-all",
                activeWorkspace === 'whiteboard' ? "bg-blue-500 text-white" : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              Whiteboard
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          {joined && (
            <button
              onClick={() => setShowChat(!showChat)}
              className={cn(
                "p-2 rounded-full border transition-all cursor-pointer",
                showChat ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300" : "border-white/10 hover:bg-white/5 text-zinc-400"
              )}
              title="Toggle Live Chat"
            >
              <MessageSquare size={16} />
            </button>
          )}
          <div className="hidden md:flex items-center gap-2 text-xs bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 px-3 py-1.5 rounded-full font-semibold">
            <ShieldCheck size={14} /> Agora Secured
          </div>
        </div>
      </div>

      {/* 2. MAIN SPLIT SECTION */}
      <div className="w-full flex-1 flex flex-row min-h-0 relative z-10">

        {/* Left Side: Video feeds OR Whiteboard Workspace */}
        <div className="flex-1 flex flex-col bg-zinc-950 p-4 relative min-w-0">

          {activeWorkspace === 'video' ? (
            /* VIDEO VIEW GRID - RESPONSIVE FOR MOBILE */
            <div className="flex-1 relative w-full h-full min-h-0">

              {/* Remote Video Box (Main Background) */}
              <div className="bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center absolute inset-0 w-full h-full">
                <div ref={remoteVideoRef} className="absolute inset-0 w-full h-full object-cover" />
                {!remoteJoined && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/90 z-10">
                    <div className="w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center mb-3">
                      <UserCheck size={28} />
                    </div>
                    <p className="font-bold text-sm">Admin / Lead Interviewer Feed</p>
                    <p className="text-xs text-zinc-500 mt-1">Waiting for interviewer to connect...</p>
                  </div>
                )}
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/15 z-20">
                  Admin / Interviewer
                </div>
              </div>

              {/* Local Video Box (Small PIP Floating Preview) */}
              <div className="bg-zinc-900 overflow-hidden shadow-2xl flex flex-col justify-end transition-all duration-300 absolute top-4 right-4 z-25 w-28 h-40 sm:w-44 sm:h-60 rounded-2xl border border-white/20">
                <div ref={localVideoRef} className="absolute inset-0 w-full h-full object-cover" />
                {isVideoMuted && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/90 z-10">
                    <VideoOff className="text-zinc-600 mb-1 w-6 h-6 sm:w-10 sm:h-10" />
                    <p className="text-[10px] sm:text-xs text-zinc-400">Camera Off</p>
                  </div>
                )}
                {!joined && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/80 z-10 text-center p-2">
                    <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center mb-1.5 sm:mb-3">
                      <Video className="w-5 h-5 sm:w-7 sm:h-7" />
                    </div>
                    <p className="font-bold text-[10px] sm:text-sm">Self Feed</p>
                  </div>
                )}
                <div className="absolute bottom-3 left-3 z-15 bg-black/60 backdrop-blur-md text-white py-1 px-2 rounded-lg text-[8px] sm:text-xs font-semibold border border-white/15">
                  You (Candidate)
                </div>
              </div>

            </div>
          ) : (
            /* WHITEBOARD VIEW */
            <div className="flex-1 flex flex-col bg-white rounded-3xl overflow-hidden border border-white/10 relative min-h-0">

              {/* Whiteboard Controls Panel */}
              <div className="px-4 py-2 bg-zinc-100 border-b border-zinc-200 flex justify-between items-center text-zinc-800 shrink-0">
                <div className="flex items-center gap-3">
                  {/* Colors */}
                  <div className="flex gap-1.5">
                    {['#000000', '#ef4444', '#3b82f6', '#10b981'].map(color => (
                      <button
                        key={color}
                        onClick={() => setBrushColor(color)}
                        className="w-6 h-6 rounded-full border transition-all cursor-pointer"
                        style={{
                          background: color,
                          borderColor: brushColor === color ? '#6366f1' : '#94a3b8',
                          borderWidth: brushColor === color ? '2px' : '1px'
                        }}
                      />
                    ))}
                  </div>

                  <div className="w-[1px] h-5 bg-zinc-300" />

                  {/* Size Selector */}
                  <select
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="px-2 py-1 rounded border border-zinc-300 text-xs font-semibold bg-white cursor-pointer"
                  >
                    <option value={2}>Thin Pen</option>
                    <option value={4}>Medium Pen</option>
                    <option value={8}>Thick Pen</option>
                    <option value={15}>Marker</option>
                  </select>
                </div>

                <button
                  onClick={() => clearLocalBoard(true)}
                  className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-600 border border-red-200 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Eraser size={13} /> Clear Board
                </button>
              </div>

              {/* Whiteboard Canvas */}
              <div className="flex-1 relative bg-white cursor-crosshair min-h-0">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="block w-full h-full"
                />
              </div>

              {/* Floating PIP Video Panels Overlay for Whiteboard */}
              <div className="absolute bottom-4 right-4 flex flex-row sm:flex-col gap-2 z-30 pointer-events-auto">
                <div className={cn(
                    "w-24 h-18 sm:w-44 sm:h-32 bg-zinc-950 border rounded-2xl overflow-hidden shadow-lg relative flex items-center justify-center transition-all duration-300 border-white/20",
                    !remoteJoined && "opacity-75"
                  )}
                >
                  <div ref={remoteVideoRef} className="absolute inset-0 w-full h-full object-cover" />
                  {!remoteJoined && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[10px] text-zinc-400 z-10">Waiting...</div>
                  )}
                  <span className="absolute bottom-1.5 left-1.5 bg-black/60 px-1.5 py-0.5 rounded text-[8px] font-bold border border-white/10 z-20">Interviewer</span>
                </div>
                <div className={cn(
                    "w-24 h-18 sm:w-44 sm:h-32 bg-zinc-950 border rounded-2xl overflow-hidden shadow-lg relative flex items-center justify-center transition-all duration-300 border-white/20",
                    isVideoMuted && "opacity-75"
                  )}
                >
                  <div ref={localVideoRef} className="absolute inset-0 w-full h-full object-cover" />
                  {isVideoMuted && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[10px] text-zinc-400 z-10">Camera Off</div>
                  )}
                  <span className="absolute bottom-1.5 left-1.5 bg-black/60 px-1.5 py-0.5 rounded text-[8px] font-bold border border-white/10 z-20">Self</span>
                </div>
              </div>

            </div>
          )}

          {/* Call Controls HUD at bottom */}
          <div className="flex justify-center gap-4 mt-4 shrink-0">
            <button
              onClick={toggleAudio}
              className={cn(
                'w-12 h-12 rounded-full border transition-all flex items-center justify-center cursor-pointer',
                isAudioMuted ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' : 'bg-zinc-800 border-white/10 text-white hover:bg-zinc-700'
              )}
              title={isAudioMuted ? 'Unmute Mic' : 'Mute Mic'}
            >
              {isAudioMuted ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            <button
              onClick={toggleVideo}
              className={cn(
                'w-12 h-12 rounded-full border transition-all flex items-center justify-center cursor-pointer',
                isVideoMuted ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' : 'bg-zinc-800 border-white/10 text-white hover:bg-zinc-700'
              )}
              title={isVideoMuted ? 'Turn Cam On' : 'Turn Cam Off'}
            >
              {isVideoMuted ? <VideoOff size={18} /> : <Video size={18} />}
            </button>

            <Button
              onClick={handleLeaveCall}
              className="bg-rose-500 hover:bg-rose-600 text-white font-bold w-12 h-12 rounded-full p-0 flex items-center justify-center cursor-pointer"
              title="Leave Session"
            >
              <PhoneOff size={18} />
            </Button>
          </div>

        </div>

        {/* Right Side: Chat Panel - RESPONSIVE OVERLAY FOR MOBILE */}
        {joined && showChat && (
          <div className={cn(
            "border-white/10 bg-zinc-900 flex flex-col shrink-0 min-h-0 shadow-2xl",
            "absolute top-0 right-0 h-full w-full sm:w-80 z-40 border-l",
            "sm:relative sm:w-80 sm:h-auto"
          )}>
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/10 shrink-0">
              <h3 className="text-xs sm:text-sm font-bold">Interview Session Chat</h3>
              <button
                onClick={() => setShowChat(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 min-h-0">
              {messages.length === 0 ? (
                <div className="text-center text-zinc-500 text-xs mt-10">
                  No messages yet. Send a note to the admin interviewer!
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMe = msg.sender.includes('You');
                  const isSystem = msg.sender === 'System';

                  if (isSystem) {
                    return (
                      <div key={i} className="text-center text-[10px] text-amber-400 bg-amber-400/5 py-1 px-2.5 rounded-lg border border-amber-400/10 italic self-center">
                        {msg.text}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={i}
                      className={cn(
                        "max-w-[85%] flex flex-col",
                        isMe ? "align-self-end items-end self-end" : "align-self-start items-start self-start"
                      )}
                    >
                      <span className="text-[10px] text-zinc-400 mb-0.5">{msg.sender}</span>
                      <div
                        className={cn(
                          "px-3 py-2 rounded-xl text-xs leading-relaxed break-words",
                          isMe ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-100"
                        )}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Chat Input */}
            <div className="p-3 border-t border-white/10 bg-black/20 shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 rounded-xl border border-white/10 bg-zinc-950 text-white text-xs outline-none focus:border-cyan-500/40"
                />
                <button
                  onClick={sendMessage}
                  className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl cursor-pointer flex items-center justify-center shrink-0"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AgoraInterviewRoom;
