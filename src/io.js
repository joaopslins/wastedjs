import Lobby from "./models/Lobby.js";
import { SocketService } from "./models/SocketService.js";
import { GamePhaseEnum } from "./constants.js";
import { wait } from "./utils.js";
import { ClientEvents, ServerEvents } from "./constants.js";

const log = console.log;
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
  log(name + " login");

  let error = lobby.checkLogin(name);

  //Return playerlist and success to requested player
  callback(error);

  if (!error) {
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
    socketService.broadcast(ServerEvents.PLAYER_CONNECT, newPlayer);
  } else {
    log(name + " login denied");
  }
};

const readyEvent = (socketService) => (client) => {
  log(client.name + " ready is " + client.ready);
  //Update player in server player list
  lobby.setReady(client);
  socketService.broadcast(ServerEvents.PLAYER_READY, client);
};

const playerBetEvent = (socketService) => (bet) => {
  log(socketService.getName() + " betted " + bet);
  lobby.game.playerBet(socket.name, bet);

  let startPlayPhase = lobby.game.phase === GamePhaseEnum.PLAY;

  socketService.emit(ServerEvents.UPDATE_BET, {
    bet: bet,
    playerWhoBet: socketService.getName(),
    nextPlayer: lobby.game.roundPlayer,
    startPlayPhase: startPlayPhase,
  });
};

const playerPlayEvent = (socketService) => async (card) => {
  log(socketService.getName() + " player card " + card);

  let { game } = lobby;
  game.playerPlayCard(socketService.getName(), card);

  if (game.phase === GamePhaseEnum.END) {
    log("round over");
    //Round is over
    socketService.emit(ServerEvents.PLAYER_PLAY_UPDATE, {
      card: card,
      playerWhoPlayed: socketService.getName(),
      nextPlayer: "",
      wonPlayer: game.winPlayer,
    });
    game.roundEnd();

    if (game.phase === GamePhaseEnum.END_MATCH) {
      await wait(callInterval);

      socketService.emit(ServerEvents.NEW_ROUND, {
        players: createClientPlayerList(game.players),
        playerToPlay: "",
      });

      //Match is over
      log("match over");
      game.matchEnd();

      if (game.phase === GamePhaseEnum.END_GAME) {
        log("game over");
        await wait(callInterval);

        lobby.game = null;
        socketService.emit(
          ServerEvents.END_GAME,
          createClientPlayerList(game.players)
        );
      } else if (game.phase === GamePhaseEnum.BET) {
        await wait(callInterval);

        socketService.emit(ServerEvents.NEW_MATCH, {
          players: createClientPlayerList(game.players),
          playerToPlay: game.startMatchPlayer,
        });
      }
    } else {
      //Match is not over
      await wait(callInterval);

      socketService.emit(ServerEvents.NEW_ROUND, {
        players: createClientPlayerList(game.players),
        playerToPlay: game.roundPlayer,
      });
    }
  } else if (game.phase === GamePhaseEnum.PLAY) {
    //Continue playing the same round
    socketService.emit(ServerEvents.PLAYER_PLAY_UPDATE, {
      card: card,
      playerWhoPlayed: socketService.getName(),
      nextPlayer: game.roundPlayer,
    });
  }
};

const startGameEvent = (socketService) => () => {
  log("game started!");
  lobby.startGame();
  socketService.emit(ServerEvents.GAME_START_NOTIFICATION, {
    startingPlayer: lobby.game.startMatchPlayer,
    playerList: createClientPlayerList(lobby.game.players),
  });
};

const requestCardsEvent = (socketService) => (data, callback) => {
  log(socketService.getName() + " asked his cards");
  callback({
    cards: lobby.game.getCardsFromPlayer(socketService.getName()),
  });
};

const requestPlayerListEvent = (socketService) => (callback) => {
  log(socketService.getName() + " asked for playerlist");
  callback({
    name: socketService.getName(),
    playerList: createClientPlayerList(lobby.players),
  });
};

const kickPlayerEvent = (socketService) => (name) => {
  log(name + " was kicked by " + socketService.getName());
  // TODO validate if was kicked by the host

  const targetSocket = socketService.getSocketByName(name);
  if (!targetSocket) return;

  targetSocket.emit(ServerEvents.KICKED);
  targetSocket.disconnect();
};

const disconnectEvent = (socketService) => () => {
  const name = socketService.getName();
  log(name + " disconnected");

  //if undefined, dont emit events
  if (name) {
    lobby.disconnect(name);

    socketService.broadcast(ServerEvents.PLAYER_DISCONNECT, name);
  }
};

export const init = (io) => {
  io.on("connection", (socket) => {
    const socketService = new SocketService(io, socket);

    socket.on(ClientEvents.LOGIN, loginEvent(socketService));
    socket.on(ClientEvents.READY, readyEvent(socketService));
    socket.on(ClientEvents.BET, playerBetEvent(socketService));
    socket.on(ClientEvents.PLAY_CARD, playerPlayEvent(socketService));
    socket.on(ClientEvents.START, startGameEvent(socketService));
    socket.on(ClientEvents.REQUEST_CARDS, requestCardsEvent(socketService));
    socket.on(
      ClientEvents.REQUEST_PLAYER_LIST,
      requestPlayerListEvent(socketService)
    );
    socket.on(ClientEvents.KICK, kickPlayerEvent(socketService));
    socket.on(ClientEvents.DISCONNECT, disconnectEvent(socketService));
  });
};
