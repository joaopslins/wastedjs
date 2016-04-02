/*
http://bigtext.org/ - Alligator2

 ::::::::     :::    ::::::::: :::::::::
:+:    :+:  :+: :+:  :+:    :+::+:    :+:
+:+        +:+   +:+ +:+    +:++:+    +:+
+#+       +#++:++#++:+#++:++#: +#+    +:+
+#+       +#+     +#++#+    +#++#+    +#+
#+#    #+##+#     #+##+#    #+##+#    #+#
 ######## ###     ######    ############

*/

/** Card
 *
 * A card with rank and suit.
 * It's value is calculated based on the rules of Fodinha.
 */
var Card = function(rank, suit) {
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
    return a.sortValue() - b.sortValue();
};


Card.prototype.RANK = ['4', '5', '6', '7', 'Q', 'J', 'K', 'A', '2', '3'];
Card.prototype.SUIT = ['S', 'H', 'C', 'D'];

Card.prototype.toString = function() {
    return Card.prototype.RANK[this.rank] + Card.prototype.SUIT[this.suit];
};

/*

::::::::: :::::::::::::::::: :::    :::
:+:    :+::+:      :+:    :+::+:   :+:
+:+    +:++:+      +:+       +:+  +:+
+#+    +:++#++:++# +#+       +#++:++
+#+    +#++#+      +#+       +#+  +#+
#+#    #+##+#      #+#    #+##+#   #+#
######### ################## ###    ###

*/

/** Deck
 *
 * A collection of cards.
 * Supports FIFO and random removal.
 */
var Deck = function () {
    this.cards = [];
}

Deck.prototype.generate = function() {
    this.cards = [];
    for(var rank = 0; rank < 10; rank++) {
        for (var suit = 0; suit < 4; suit++) {
            this.cards.push( new Card(rank, suit) );
        };
    }
};

Deck.prototype.shuffle = function() {
    if(this.empty()) this.generate();

    for(var times = 0; times < 200; times++) {
        var i = Math.floor( Math.random() * this.cards.length );
        var j = Math.floor( Math.random() * this.cards.length );

        var tmp = this.cards[i];
        this.cards[i] = this.cards[j];
        this.cards[j] = tmp;
    }
};

Deck.prototype.sort = function() {
    this.cards.sort(Card.prototype.sortComparator);
};

Deck.prototype.at = function(index) {
    return this.cards.at(index);
};

Deck.prototype.draw = function() {
    return this.cards.shift();
};

Deck.prototype.push = function(card) {
    this.cards.push(card);
};

Deck.prototype.remove = function(index) {
    var tail = this.cards.splice(index);
    var card = tail.shift();

    this.cards.concat(tail);

    return card;
};

Deck.prototype.size = function() {
    return this.cards.length;
};

Deck.prototype.empty = function() {
    return this.cards.length == 0;
};

Deck.prototype.toString = function() {
    return this.cards.toString();
};

Deck.prototype.distribute = function(players, qty) {
    for (var times = 0; times < qty; times++) {
        for(var i in players) {
            var player = players[i];

            player.takeCard(this.draw());
        }
    }
};

/*

::::::::: :::           :::  :::   ::::::::::::::::::::::
:+:    :+::+:         :+: :+::+:   :+::+:       :+:    :+:
+:+    +:++:+        +:+   +:++:+ +:+ +:+       +:+    +:+
+#++:++#+ +#+       +#++:++#++:+#++:  +#++:++#  +#++:++#:
+#+       +#+       +#+     +#+ +#+   +#+       +#+    +#+
#+#       #+#       #+#     #+# #+#   #+#       #+#    #+#
###       #############     ### ###   #############    ###



*/

/** Player
 *
 * A player of Fodinha.
 */
var Player = function () {
    this.lives = Player.prototype.LIVES;

    this.hand = new Deck();
    this.chosen = false;
}

Player.prototype.LIVES = 3;

Player.prototype.takeCard = function(card) {
    this.hand.push(card);
};

Player.prototype.play = function() {
    var card = this.hand.remove(this.chosen);
    this.chosen = false;

    return card;
};

Player.prototype.choose = function(choice) {
    this.chosen = choice;
};

Player.prototype.toString = function() {
    return ''+ this.hand;
};

/*
    Exporting to node.js main file
*/

module.exports = {
    card : Card,
    deck : Deck,
    player : Player
}
