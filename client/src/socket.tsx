import React, { createContext, useContext, useEffect, useState } from "react";
import SocketIOClient from "socket.io-client";
import { ClientEvents } from "./constants";

const SocketContext = createContext<Socket>(undefined!);

type SocketProviderProps = {
  children: React.ReactNode;
};

class Socket {
  constructor(private socket: SocketIOClient.Socket) {}

  private emit = (event: ClientEvents, ...args: any[]) => {
    return new Promise<any>((res) => {
      this.socket.emit(event, ...args, (data: any) => {
        res(data);
      });
    });
  };

  login = (name: string): Promise<number> => {
    return this.emit(ClientEvents.LOGIN, name);
  };
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [socketValue, setSocketValue] = useState<Socket | null>(null);

  useEffect(() => {
    const socket = SocketIOClient(
      process.env.REACT_APP_SOCKET_ADDRESS || "http://localhost:5000"
    );
    socket.connect();

    // TODO listen to events
    setSocketValue(new Socket(socket));
  }, []);

  if (!socketValue) return null;

  return (
    <SocketContext.Provider value={socketValue}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
