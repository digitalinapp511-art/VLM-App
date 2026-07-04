import { io, Socket } from "socket.io-client";

let socketInstance: Socket | null = null;

export const getSocket = (): Socket => {
  const token = localStorage.getItem("vlm_token");
  if (!socketInstance) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api";
    const socketUrl = baseUrl.replace("/api", "");

    socketInstance = io(socketUrl, {
      auth: { token },
      autoConnect: false,
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
