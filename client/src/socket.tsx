import React, { createContext, useContext, useEffect, useState } from "react";
import SocketIOClient from "socket.io-client";
import { ClientEvents } from "./constants";

const SocketContext = createContext<Socket>(undefined!);

type SocketProviderProps = {
  children: React.ReactNode;
};

class Socket {
  constructor(private socket: SocketIOClient.Socket) {}

  isConnected = false;

  private emit = (event: ClientEvents, ...args: any[]) => {
    return new Promise<any>((res) => {
      this.socket.emit(event, ...args, (data: any) => {
        res(data);
      });
    });
  };

  login = (name: string): Promise<string> => {
    this.connect();
    return this.emit(ClientEvents.LOGIN, name);
  };

  requestPlayerList = () => {
    return this.emit(ClientEvents.REQUEST_PLAYER_LIST);
  };

  connect = () => {
    this.socket.connect();
    this.isConnected = true;
  };

  disconnect = () => {
    this.socket.disconnect();
    this.isConnected = false;
  };
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [socketValue, setSocketValue] = useState<Socket | null>(null);

  useEffect(() => {
    const socket = SocketIOClient(
      process.env.REACT_APP_SOCKET_ADDRESS || "http://localhost:5000"
    );

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
