import Card from "./card.js";

export default class Deck {
  constructor() {
    this.cards = [];
  }

  generate = () => {
    this.cards = [];
    for (let rank = 0; rank < 10; rank++) {
      for (let suit = 0; suit < 4; suit++) {
        this.cards.push(new Card(rank, suit));
      }
    }
  };

  shuffle = () => {
    if (this.empty()) this.generate();

    for (let times = 0; times < 200; times++) {
      let i = Math.floor(Math.random() * this.cards.length);
      let j = Math.floor(Math.random() * this.cards.length);

      let tmp = this.cards[i];
      this.cards[i] = this.cards[j];
      this.cards[j] = tmp;
    }
  };

  sort = () => {
    this.cards.sort(Card.prototype.sortComparator);
  };

  at = (index) => {
    return this.cards.at(index);
  };

  draw = () => {
    return this.cards.shift();
  };

  push = (card) => {
    this.cards.push(card);
  };

  remove = (choice) => {
    this.cards = this.cards.filter((card) => card.toString() !== choice);
  };

  size = () => this.cards.length;

  empty = () => this.cards.length == 0;

  toString = () => this.cards.toString();

  getCards = () => {
    let ret = [];

    this.cards.forEach((card) => {
      ret.push(card.toString());
    });

    return ret;
  };

  distribute = (players, qty) => {
    //Reset players' hands when distribute
    players.forEach((player) => (player.hand = new Deck()));

    for (let times = 0; times < qty; times++) {
      players.forEach((player) => {
        player.takeCard(this.draw());
      });
    }
  };

  getCard = (card) =>
    this.cards.find((deckCard) => deckCard.toString() === card);
}
