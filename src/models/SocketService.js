export class SocketService {
  constructor(io, socket) {
    this.io = io;
    this.socket = socket;
  }

  // sending to all connected clients
  emit = (event, object) => {
    return this.io.emit(event, object);
  };

  // sending to all clients except sender
  broadcast = (event, object) => {
    return this.socket.broadcast.emit(event, object);
  };

  getSocketByName = (name) => {
    for (const socket of Object.values(this.io.sockets.connected)) {
      if (socket.name === name) {
        return socket;
      }
    }

    return;
  };

  getName = () => this.socket.name;

  setName = (name) => {
    this.socket.name = name;
  };
}
