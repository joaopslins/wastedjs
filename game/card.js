/** Card
 *
 * A card with rank and suit.
 * It's value is calculated based on the rules of Fodinha.
 */
function Card(rank, suit) {
    this.rank = rank;
    this.suit = suit;
}

Card.prototype.value = function() {
           if(this.rank == 0 && this.suit == 2) { /* 4   of Clubs */
        return 13;
    } else if(this.rank == 3 && this.suit == 1) { /* 7   of Hearts */
        return 12;
    } else if(this.rank == 7 && this.suit == 0) { /* Ace of Spades */
        return 11;
    } else if(this.rank == 3 && this.suit == 3) { /* 7   of Diamonds */
        return 10;
    } else {
        return this.rank;
    }
};


Card.prototype.sortValue = function() {
    return 4 * this.value() + this.suit;
};

Card.prototype.sortComparator = function(a, b) {
    return a.sortValue() > b.sortValue();
};


Card.prototype.RANK = ['4', '5', '6', '7', 'Q', 'J', 'K', 'A', '2', '3'];
Card.prototype.SUIT = ['S', 'H', 'C', 'D'];

Card.prototype.toString = function() {
    return Card.prototype.RANK[this.rank] + Card.prototype.SUIT[this.suit];
};