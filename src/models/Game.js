import Deck from "./Deck.js";

import { GamePhaseEnum } from "../constants.js";

//Executes when a game starts
export default class Game {
  constructor(players) {
    this.players = players;

    this.startMatchPlayer = players[0].name;
    this.startRoundPlayer = players[0].name;
    this.roundPlayer = this.startRoundPlayer;
    this.matchNumber = 2;
    this.roundNumber = 0;

    this.playersQty = players.length;

    this.players.forEach((player) => {
      player.lives = 3;
      player.isAlive = true;
    });

    this.startMatch();
  }

  startMatch = () => {
    //Phase and win configs
    this.phase = GamePhaseEnum.BET;
    this.winCard = null;
    this.winPlayer = "";
    this.isTied = false;

    //Distribute cards
    let deck = new Deck();
    deck.shuffle();
    deck.distribute(this.players, this.matchNumber);

    //Reset Players
    this.players.forEach((player) => {
      player.won = 0;
      player.bet = "-";
      player.card = "";
      player.hand.sort();
    });
  };

  getPlayer = (playerName) =>
    this.players.find((player) => player.name === playerName);

  getPlayerIndex = (playerName) =>
    this.players.findIndex((player) => player.name === playerName);

  getCardsFromPlayer = (playerName) => {
    let player = this.getPlayer(playerName);

    return player.hand.getCards();
  };

  setNextPlayer = (isNextMatch) => {
    let found = false;
    let startIndex = null;
    let index = null;

    while (!found) {
      if (isNextMatch) {
        index = this.getPlayerIndex(this.startMatchPlayer);
      } else {
        index = this.getPlayerIndex(this.roundPlayer);
      }

      //Get first index
      if (startIndex == null) {
        startIndex = index;
      }

      index++;

      if (index == this.players.length) {
        index = 0;
      }

      if (isNextMatch) {
        this.startMatchPlayer = this.players[index].name;
      } else {
        this.roundPlayer = this.players[index].name;
      }

      //Only pick a player if he's alive
      if (this.players[index].isAlive) {
        found = true;
      }

      //If no one is alive, end game
      if (index === startIndex) {
        found = true;
      }
    }
  };

  playerBet = (name, bet) => {
    this.getPlayer(name).bet = bet;

    this.setNextPlayer(false);

    //End bet phase
    if (this.roundPlayer === this.startRoundPlayer) {
      this.phase = GamePhaseEnum.PLAY;
      this.roundNumber = this.matchNumber;

      this.winCard = null;
      this.winPlayer = "";
      this.isTied = false;
    }
  };

  playerPlayCard = (name, cardStr) => {
    let cards = this.getPlayer(name).hand;
    let card = cards.getCard(cardStr);

    //Updates winner card when someone plays
    if (this.winCard === null) {
      this.winPlayer = name;
      this.winCard = card;
      this.isTied = false;
    } else {
      if (card.value() > this.winCard.value()) {
        this.winCard = card;
        this.winPlayer = name;
        this.isTied = false;
      } else if (card.value() == this.winCard.value()) {
        this.winPlayer = name;
        this.isTied = true;
      }
    }

    //Remove card played
    cards.hand.remove(card.toString());

    this.setNextPlayer(false);

    //End round
    if (this.roundPlayer === this.startRoundPlayer) {
      this.phase = GamePhaseEnum.END;
    }
  };

  roundEnd = () => {
    this.roundNumber--;

    //Set win
    const winner = this.getPlayer(this.winPlayer);
    if (!this.isTied) {
      winner.won++;
    }

    //Set next round players
    this.startRoundPlayer = this.winPlayer;
    this.roundPlayer = this.winPlayer;

    //Set next phase
    if (this.roundNumber > 0) {
      this.phase = GamePhaseEnum.PLAY;
    } else {
      //Match ended
      this.phase = GamePhaseEnum.END_MATCH;
    }

    //Set round win settings
    this.winCard = null;
    this.winPlayer = "";
    this.isTied = false;
  };

  matchEnd = () => {
    let playersAlive = 0;

    //Reduce lives and reset settings
    this.players.forEach((player) => {
      player.loseLives();
      player.won = 0;
      player.bet = "-";
      player.card = "";

      if (player.isAlive) {
        playersAlive++;
      }
    });

    //Setting next player configs
    this.setNextPlayer(true);
    this.startRoundPlayer = this.startMatchPlayer;
    this.roundPlayer = this.startRoundPlayer;

    //Update match number and checks if game ended
    this.matchNumber++;
    if (this.matchNumber > 8 || playersAlive < 2) {
      this.phase = GamePhaseEnum.END_GAME;
    } else {
      this.startMatch();
    }
  };
}
