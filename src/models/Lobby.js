import Game from "./Game.js";
import Player from "./Player.js";

const isNameUnavailable = (name, players) => {
  return !!players.find((player) => player.name === name);
};

export default class Lobby {
  constructor() {
    this.game = null;
    this.players = [];
  }

  addPlayer = (playerName) => {
    let newPlayer = new Player(playerName);
    this.players.push(newPlayer);

    return newPlayer;
  };

  setReady = (client) => {
    const player = this.players.find((player) => player.name === client.name);
    if (player) {
      player.ready = client.ready;
    }
  };

  checkLogin = (name) => {
    if (isNameUnavailable(name, this.players)) {
      return 1;
    } else if (this.players.length === 5) {
      //If game is full
      return 2;
    } else if (!this.game) {
      //If game is on
      return 3;
    }

    return 0;
  };

  startGame = () => {
    this.players.forEach((player) => {
      player.ready = false;
    });
    this.game = new Game(this.players);
  };

  disconnect = (name) => {
    //If undefined, dont close game;
    if (name == null) {
      return;
    }

    //Remove player from server playlist
    this.players = this.players.filter((player) => player.name != name);

    //Undo game
    if (this.game) {
      this.game = null;

      //Reset players
      this.players.forEach((player) => {
        player.ready = false;
      });
    }
  };
}
