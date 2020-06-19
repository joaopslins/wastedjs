import Deck from "./Deck.js";

export default class Player {
  constructor(name) {
    this.name = name;
    this.ready = false;
    this.lives = 3;
    this.won = 0;
    this.bet = "-";
    this.card = "";
    this.isAlive = true;

    this.hand = new Deck();
  }

  takeCard = (card) => {
    this.hand.push(card);
  };

  play = (cardName) => {
    this.hand.remove(cardName);
  };

  toString = () => {
    return "" + this.hand;
  };

  loseLives = () => {
    let lostLives = Math.abs(this.won - this.bet);

    this.lives -= lostLives;

    //Check if player is out of the game
    if (this.lives <= 0) {
      this.isAlive = false;
    }
  };
}
