import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (user && !socketRef.current) {
      // Use VITE_API_URL for external backend (Railway), fallback to same-origin for local dev
      const socketUrl = (import.meta.env.VITE_API_URL as string) || window.location.origin;
      const s = io(socketUrl, {
        auth: { token: user.token, userId: user.id, username: user.username },
        transports: ["websocket", "polling"],
      });
      socketRef.current = s;
      setSocket(s);

      // Join personal user room on connect
      s.on("connect", () => {
        s.emit("join_user_room");
      });
    }

    if (!user && socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
