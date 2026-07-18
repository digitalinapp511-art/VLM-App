import { io, Socket } from "socket.io-client";

const isDev = import.meta.env.DEV;

let socketInstance: Socket | null = null;

export const getSocket = (): Socket => {
  const token = localStorage.getItem("vlm_token");
  if (!socketInstance) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api";
    const socketUrl = baseUrl.replace("/api", "");

    if (isDev) console.log("[Socket] Connecting to:", socketUrl);

    socketInstance = io(socketUrl, {
      auth: { token },
      autoConnect: false,
      transports: ["websocket", "polling"],
    });

    socketInstance.on("connect", () => {
      if (isDev) console.log("[Socket] Connected. ID:", socketInstance?.id);
    });

    socketInstance.on("connect_error", (err) => {
      // Always log errors — even in production so engineers can debug via browser devtools if needed
      console.error("[Socket] Connection error:", err.message);
    });

    socketInstance.on("disconnect", (reason) => {
      if (isDev) console.log("[Socket] Disconnected:", reason);
    });
  } else {
    socketInstance.auth = { token };
  }
  return socketInstance;
};

export const connectSocket = () => {
  const token = localStorage.getItem("vlm_token");
  if (!token) return; // Prevent connecting without an auth token to avoid connection loops
  const socket = getSocket();
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};
