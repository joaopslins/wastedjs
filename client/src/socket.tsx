import React, { createContext, useContext, useEffect, useState } from "react";
import SocketIOClient from "socket.io-client";
import { ClientEvents, ServerEvents } from "./constants";
import {
  Player,
  playerConnect,
  playerReady,
  playerRemove,
} from "./redux/gameSlice";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";

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

  ready = (name: string, ready: boolean) => {
    return this.emit(ClientEvents.READY, {
      name,
      ready,
    });
  };

  startGame = () => {
    return this.emit(ClientEvents.START);
  };

  removePlayer = (playerName: string) => {
    return this.emit(ClientEvents.KICK, playerName);
  };

  connect = () => {
    this.isConnected = true;
    this.socket.connect();
  };

  disconnect = () => {
    this.isConnected = false;
    this.socket.disconnect();
  };
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [socketValue, setSocketValue] = useState<Socket | null>(null);
  const history = useHistory();
  const dispatch = useDispatch();

  useEffect(() => {
    const socket = SocketIOClient(
      process.env.REACT_APP_SOCKET_ADDRESS || "http://localhost:5000"
    );

    socket.on(ServerEvents.PLAYER_CONNECT, (data: Player) => {
      dispatch(playerConnect(data));
    });
    socket.on(
      ServerEvents.PLAYER_READY,
      (data: { name: string; ready: boolean }) => {
        dispatch(playerReady(data));
      }
    );
    socket.on(ServerEvents.KICKED, () => {
      history.push("/");
    });
    socket.on(ServerEvents.PLAYER_DISCONNECT, (data: string) => {
      dispatch(playerRemove(data));
    });

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
