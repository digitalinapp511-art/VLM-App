import { io, Socket } from "socket.io-client";

let socketInstance: Socket | null = null;

export const getSocket = (): Socket => {
  const token = localStorage.getItem("vlm_token");
  if (!socketInstance) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api";
    const socketUrl = baseUrl.replace("/api", "");

    console.log("[Socket] Initializing socket connection to URL:", socketUrl);

    socketInstance = io(socketUrl, {
      auth: { token },
      autoConnect: false,
      transports: ["websocket", "polling"], // Allow polling fallback in case WebSocket is blocked
    });

    socketInstance.on("connect", () => {
      console.log("[Socket] Successfully connected! ID:", socketInstance?.id);
    });

    socketInstance.on("connect_error", (err) => {
      console.error("[Socket] Connection error details:", err.message, err);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected. Reason:", reason);
    });
  } else {
    socketInstance.auth = { token };
  }
  return socketInstance;
};

export const connectSocket = () => {
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
