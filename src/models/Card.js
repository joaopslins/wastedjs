export default class Card {
  RANK = ["4", "5", "6", "7", "Q", "J", "K", "A", "2", "3"];
  SUIT = ["S", "H", "C", "D"];

  constructor(rank, suit) {
    this.rank = rank;
    this.suit = suit;
  }

  value = () => {
    if (this.rank == 0 && this.suit == 2) {
      /* 4 of Clubs */
      return 13;
    } else if (this.rank == 3 && this.suit == 1) {
      /* 7 of Hearts */
      return 12;
    } else if (this.rank == 7 && this.suit == 0) {
      /* Ace of Spades */
      return 11;
    } else if (this.rank == 3 && this.suit == 3) {
      /* 7 of Diamonds */
      return 10;
    } else {
      return this.rank;
    }
  };

  sortValue = () => 4 * this.value() + this.suit;

  sortComparator = (a, b) => b.sortValue() - a.sortValue();

  toString = () =>
    Card.prototype.RANK[this.rank] + Card.prototype.SUIT[this.suit];
}
