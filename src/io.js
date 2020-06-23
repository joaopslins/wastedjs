import Lobby from "./models/Lobby.js";
import { SocketService } from "./models/SocketService.js";
import { GamePhaseEnum } from "./constants.js";
import { wait } from "./utils.js";
import { ClientSocketEvents } from "../shared/SocketEvents.js";

const lobby = new Lobby();
const callInterval = 3000; //in ms

const createClientPlayerList = (playerL) =>
  playerL.map((player) => ({
    name: player.name,
    ready: player.ready,
    lives: player.lives,
    won: player.won,
    bet: player.bet,
    isAlive: player.isAlive,
    card: "",
  }));

const loginEvent = (socketService) => (name, callback) => {
  console.log(name + " login");

  let success = lobby.checkLogin(name);

  //Return playerlist and success to requested player
  callback(success);

  if (success === 0) {
    //Add new player to server player list and socket
    socketService.setName(name);
    let newPlayer = lobby.addPlayer(name);

    let convert = (player) => ({
      name: player.name,
      ready: player.ready,
      lives: player.lives,
      won: player.won,
      bet: player.bet,
      isAlive: player.isAlive,
      card: "",
    });

    newPlayer = convert(newPlayer);

    //Update new player to other clients
    socketService.broadcast(ClientSocketEvents.PLAYER_CONNECT, newPlayer);
  } else {
    console.log(name + " login denied");
  }
};

const readyEvent = (socketService) => (client) => {
  console.log(client.name + " ready is " + client.ready);
  //Update player in server player list
  lobby.setReady(client);
  socketService.broadcast(ClientSocketEvents.PLAYER_READY, client);
};

const playerBetEvent = (socketService) => (bet) => {
  console.log(socketService.getName() + " betted " + bet);
  lobby.game.playerBet(socket.name, bet);

  let startPlayPhase = lobby.game.phase === GamePhaseEnum.PLAY;

  socketService.emit(ClientSocketEvents.UPDATE_BET, {
    bet: bet,
    playerWhoBet: socketService.getName(),
    nextPlayer: lobby.game.roundPlayer,
    startPlayPhase: startPlayPhase,
  });
};

const playerPlayEvent = (socketService) => async (card) => {
  console.log(socketService.getName() + " player card " + card);

  let { game } = lobby;
  game.playerPlayCard(socketService.getName(), card);

  if (game.phase === GamePhaseEnum.END) {
    console.log("round over");
    //Round is over
    socketService.emit(ClientSocketEvents.PLAYER_PLAY_UPDATE, {
      card: card,
      playerWhoPlayed: socketService.getName(),
      nextPlayer: "",
      wonPlayer: game.winPlayer,
    });
    game.roundEnd();

    if (game.phase === GamePhaseEnum.END_MATCH) {
      await wait(callInterval);

      socketService.emit(ClientSocketEvents.NEW_ROUND, {
        players: createClientPlayerList(game.players),
        playerToPlay: "",
      });

      //Match is over
      console.log("match over");
      game.matchEnd();

      if (game.phase === GamePhaseEnum.END_GAME) {
        console.log("game over");
        await wait(callInterval);

        lobby.game = null;
        socketService.emit(
          ClientSocketEvents.END_GAME,
          createClientPlayerList(game.players)
        );
      } else if (game.phase === GamePhaseEnum.BET) {
        await wait(callInterval);

        socketService.emit(ClientSocketEvents.NEW_MATCH, {
          players: createClientPlayerList(game.players),
          playerToPlay: game.startMatchPlayer,
        });
      }
    } else {
      //Match is not over
      await wait(callInterval);

      socketService.emit(ClientSocketEvents.NEW_ROUND, {
        players: createClientPlayerList(game.players),
        playerToPlay: game.roundPlayer,
      });
    }
  } else if (game.phase === GamePhaseEnum.PLAY) {
    //Continue playing the same round
    socketService.emit(ClientSocketEvents.PLAYER_PLAY_UPDATE, {
      card: card,
      playerWhoPlayed: socketService.getName(),
      nextPlayer: game.roundPlayer,
    });
  }
};

const startGameEvent = (socketService) => () => {
  console.log("game started!");
  lobby.startGame();
  socketService.emit(ClientSocketEvents.GAME_START_NOTIFICATION, {
    startingPlayer: lobby.game.startMatchPlayer,
    playerList: createClientPlayerList(lobby.game.players),
  });
};

const requestCardsEvent = (socketService) => (data, callback) => {
  console.log(socketService.getName() + " asked his cards");
  callback({
    cards: lobby.game.getCardsFromPlayer(socketService.getName()),
  });
};

const requestPlayerListEvent = (socketService) => (data, callback) => {
  console.log(socketService.getName() + " asked for playerlist");
  callback({
    name: socketService.getName(),
    playerList: createClientPlayerList(lobby.players),
  });
};

const kickPlayerEvent = (socketService) => (name) => {
  console.log(name + " was kicked by " + socketService.getName());

  const targetSocket = socketService.getSocketByName(name);
  targetSocket.emit(ClientSocketEvents.KICKED);
  targetSocket.disconnect();
};

const disconnectEvent = (socketService) => () => {
  console.log(socketService.name + " disconnected");
  const name = socketService.getName();
  //if undefined, dont emit events
  if (name) {
    lobby.disconnect(name);

    socketService.broadcast(ClientSocketEvents.PLAYER_DISCONNECT, name);
  }
};

export const init = (io) => {
  io.on("connection", (socket) => {
    socketService = new SocketService(io, socket);

    socket.on("login", loginEvent(socketService));
    socket.on("ready", readyEvent(socketService));
    socket.on("player-bet", playerBetEvent(socketService));
    socket.on("player-play-card", playerPlayEvent(socketService));
    socket.on("start-game", startGameEvent(socketService));
    socket.on("request-cards", requestCardsEvent(socketService));
    socket.on("request-playerlist", requestPlayerListEvent(socketService));
    socket.on("kick-player", kickPlayerEvent(socketService));
    socket.on("disconnect", disconnectEvent(socketService));
  });
};
