import React, { useEffect } from "react";
import { useSocket } from "../socket";

export const LobbyPage = () => {
  const socket = useSocket();
  useEffect(() => {
    const request = async () => {
      const data = await socket.requestPlayerList();
      // TODO add action to store playerlist and user name
    };

    request();
  }, []);
  return null;
};
