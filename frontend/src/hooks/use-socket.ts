/**
 * use-socket.ts
 * Shared React hook for socket.io real-time events.
 * Provides live data for:
 *  - incoming doubt requests (teacher side)
 *  - session_accepted / session_missed / session_declined (student side)
 */
import { useEffect, useState, useCallback } from "react";
import { getSocket, connectSocket, disconnectSocket } from "@/lib/socket";
import type { Socket } from "socket.io-client";
import { apiClient } from "@/lib/api-client";

// ── Types ─────────────────────────────────────────────────────────────────

export interface IncomingRequest {
  requestId: string;
  sessionId: string;
  sessionType: "chat" | "audio" | "video";
  subject: string;
  class: string;
  board: string;
  language: string;
  doubtText: string;
  doubtImage?: string;
  topic?: string;
  timerExpiresAt: string;
  ratePerMinute?: number;
  student: {
    name: string;
    nickname?: string;
    class: string;
    photo?: string;
    planStatus?: string;
  };
}

export interface SessionAcceptedPayload {
  sessionId: string;
  sessionType: "chat" | "audio" | "video";
  teacherName: string;
  teacherPhoto?: string;
  teacherRating?: number;
  agoraChannel: string;
  requestId: string;
}

export interface SessionMissedPayload {
  requestId: string;
  sessionId?: string;
  message: string;
}

// ── Hook ──────────────────────────────────────────────────────────────────

interface UseSocketOptions {
  /** Connect immediately on mount. Default: true */
  autoConnect?: boolean;
  /** Joined session ID for room events (chat, whiteboard) */
  sessionId?: string;
}

export function useSocket(options: UseSocketOptions = {}) {
  const { autoConnect = true, sessionId } = options;

  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Teacher-side: incoming doubt request
  const [incomingRequest, setIncomingRequest] = useState<IncomingRequest | null>(null);

  // Student-side: session accepted by teacher
  const [sessionAccepted, setSessionAccepted] = useState<SessionAcceptedPayload | null>(null);

  // Student-side: no teacher found
  const [sessionMissed, setSessionMissed] = useState<SessionMissedPayload | null>(null);

  // Student-side: all teachers declined
  const [sessionDeclined, setSessionDeclined] = useState<SessionMissedPayload | null>(null);

  // Chat: real-time messages
  const [lastMessage, setLastMessage] = useState<any | null>(null);
  const [typingUserId, setTypingUserId] = useState<string | null>(null);

  // Whiteboard: remote draw actions
  const [remoteDrawAction, setRemoteDrawAction] = useState<any | null>(null);
  const [remoteClearCanvas, setRemoteClearCanvas] = useState(0);
  const [remoteWhiteboardToggle, setRemoteWhiteboardToggle] = useState<{ show: boolean } | null>(null);

  // Call: ended signal
  const [callEnded, setCallEnded] = useState(false);

  useEffect(() => {
    if (!autoConnect) return;

    connectSocket();
    const s = getSocket();
    setSocket(s);
    setIsConnected(s.connected);

    // Fetch pending requests on mount so the teacher doesn't have to manually refresh the page
    const checkPendingRequests = async () => {
      try {
        const role = localStorage.getItem("vlm_role");
        if (role === "teacher") {
          const res = await apiClient.get('/teacher/incoming-requests');
          if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
            const req = res.data.data[0];
            setIncomingRequest({
              requestId: req._id,
              sessionId: req.sessionId || "",
              sessionType: req.sessionType || "video",
              subject: req.subject || "",
              class: req.class || "",
              board: req.board || "",
              language: req.language || "",
              doubtText: req.doubtText || "",
              doubtImage: req.doubtImage || "",
              topic: req.topic || "",
              timerExpiresAt: req.timerExpiresAt || "",
              student: {
                name: req.studentId?.fullName || "Student",
                photo: req.studentId?.profilePhoto || "",
                class: req.studentId?.class || "10",
              },
            });
          }
        }
      } catch (err) {
        console.error("Failed to load teacher pending requests:", err);
      }
    };
    checkPendingRequests();

    // ── Connection events ────────────────────────────────────────────────
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    // ── Teacher: incoming request popup ──────────────────────────────────
    const onNewRequest = (data: IncomingRequest) => {
      console.log('Received new_request on frontend!', data);
      setIncomingRequest(data);
    };

    const onRequestExpired = (data: { requestId: string }) => {
      console.log('Received request_expired on frontend!', data);
      setIncomingRequest((prev) => {
        if (prev && prev.requestId === data.requestId) {
          return null;
        }
        return prev;
      });
    };

    // ── Student: teacher accepted ─────────────────────────────────────────
    const onSessionAccepted = (data: SessionAcceptedPayload) => {
      console.log("[Socket] Received session_accepted on frontend!", data);
      setSessionAccepted(data);
    };

    // ── Student: nobody accepted (timer expired) ──────────────────────────
    const onRequestMissed = (data: SessionMissedPayload) => {
      console.log("[Socket] Received request_missed on frontend!", data);
      setSessionMissed(data);
    };

    // ── Student: all teachers declined ───────────────────────────────────
    const onSessionDeclined = (data: SessionMissedPayload) => {
      console.log("[Socket] Received session_declined on frontend!", data);
      setSessionDeclined(data);
    };

    // ── Chat messages ─────────────────────────────────────────────────────
    const onNewMessage = (msg: any) => {
      console.log("[Socket] Received new_message on frontend!", msg);
      setLastMessage(msg);
    };
    const onTyping = (data: { userId: string }) => setTypingUserId(data.userId);
    const onStopTyping = () => setTypingUserId(null);

    // ── Whiteboard ────────────────────────────────────────────────────────
    const onWhiteboardDraw = (data: any) => setRemoteDrawAction(data);
    const onWhiteboardClear = () => setRemoteClearCanvas((n) => n + 1);
    const onWhiteboardToggle = (data: { show: boolean }) => setRemoteWhiteboardToggle(data);

    // ── Call end ──────────────────────────────────────────────────────────
    const onCallEnded = () => setCallEnded(true);

    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);
    s.on("new_request", onNewRequest);
    s.on("request_expired", onRequestExpired);
    s.on("session_accepted", onSessionAccepted);
    s.on("request_missed", onRequestMissed);
    s.on("session_declined", onSessionDeclined);
    s.on("new_message", onNewMessage);
    s.on("user_typing", onTyping);
    s.on("user_stop_typing", onStopTyping);
    s.on("whiteboard_draw", onWhiteboardDraw);
    s.on("whiteboard_clear", onWhiteboardClear);
    s.on("whiteboard_toggle", onWhiteboardToggle);
    s.on("call_ended", onCallEnded);

    return () => {
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
      s.off("new_request", onNewRequest);
      s.off("request_expired", onRequestExpired);
      s.off("session_accepted", onSessionAccepted);
      s.off("request_missed", onRequestMissed);
      s.off("session_declined", onSessionDeclined);
      s.off("new_message", onNewMessage);
      s.off("user_typing", onTyping);
      s.off("user_stop_typing", onStopTyping);
      s.off("whiteboard_draw", onWhiteboardDraw);
      s.off("whiteboard_clear", onWhiteboardClear);
      s.off("whiteboard_toggle", onWhiteboardToggle);
      s.off("call_ended", onCallEnded);
    };
  }, [autoConnect]);

  // Join/leave session room
  useEffect(() => {
    const s = getSocket();
    if (!s || !sessionId) return;
    
    const joinRoom = () => {
      s.emit("join_session", sessionId);
      console.log(`[Socket] Joined session room: session:${sessionId}`);
    };

    if (s.connected) {
      joinRoom();
    }

    s.on("connect", joinRoom);
    return () => {
      s.off("connect", joinRoom);
      s.emit("leave_session", sessionId);
    };
  }, [sessionId, isConnected]);

  // ── Emit helpers ─────────────────────────────────────────────────────────

  const sendMessage = useCallback(
    (messageData: { sessionId: string; content: string; type?: string; mediaUrl?: string }) => {
      const s = getSocket();
      s.emit("send_message", messageData);
    },
    []
  );

  const sendTyping = useCallback((sId: string) => {
    const s = getSocket();
    s.emit("typing", { sessionId: sId });
  }, []);

  const sendStopTyping = useCallback((sId: string) => {
    const s = getSocket();
    s.emit("stop_typing", { sessionId: sId });
  }, []);

  const sendWhiteboardDraw = useCallback((sId: string, payload: any) => {
    const s = getSocket();
    s.emit("whiteboard_draw", { sessionId: sId, ...payload });
  }, []);

  const sendWhiteboardClear = useCallback((sId: string) => {
    const s = getSocket();
    s.emit("whiteboard_clear", { sessionId: sId });
  }, []);

  const sendWhiteboardToggle = useCallback((sId: string, show: boolean) => {
    const s = getSocket();
    s.emit("whiteboard_toggle", { sessionId: sId, show });
  }, []);

  const sendCallEnd = useCallback((sId: string) => {
    const s = getSocket();
    s.emit("call_end", { sessionId: sId });
  }, []);

  const dismissIncomingRequest = useCallback(() => setIncomingRequest(null), []);
  const dismissSessionAccepted = useCallback(() => setSessionAccepted(null), []);

  return {
    socket,
    isConnected,
    // Events
    incomingRequest,
    sessionAccepted,
    sessionMissed,
    sessionDeclined,
    lastMessage,
    typingUserId,
    remoteDrawAction,
    remoteClearCanvas,
    remoteWhiteboardToggle,
    callEnded,
    // Actions
    sendMessage,
    sendTyping,
    sendStopTyping,
    sendWhiteboardDraw,
    sendWhiteboardClear,
    sendWhiteboardToggle,
    sendCallEnd,
    dismissIncomingRequest,
    dismissSessionAccepted,
  };
}
