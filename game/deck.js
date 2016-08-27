'use strict';

var Card = require ("./card");

var Deck = function () {
    this.cards = [];
};

Deck.prototype.generate = function() {
    this.cards = [];
    for(let rank = 0; rank < 10; rank++) {
        for (let suit = 0; suit < 4; suit++) {
            this.cards.push( new Card(rank, suit) );
        };
    }
};

Deck.prototype.shuffle = function() {
    if(this.empty()) this.generate();

    for(let times = 0; times < 200; times++) {
        let i = Math.floor( Math.random() * this.cards.length );
        let j = Math.floor( Math.random() * this.cards.length );

        let tmp = this.cards[i];
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

Deck.prototype.remove = function(choice) {
    this.cards = this.cards.filter(function(card) {
        return card.toString() != choice
    });
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

Deck.prototype.getCards = function(){
    let ret = [];
    for(let i = 0; i < this.cards.length; i++){
        ret.push(this.cards[i].toString());
    }

    return ret;
};

Deck.prototype.distribute = function(players, qty) {
    //Reset players' hands when distribute
    for(let i in players){
        players[i].hand = new Deck();
    }

    for (let times = 0; times < qty; times++) {
        for(let i in players) {
            let player = players[i];

            player.takeCard(this.draw());
        }
    }
};

Deck.prototype.getCard = function (card) {
    for (let i in this.cards) {
        if (this.cards[i].toString() == card) {
            return this.cards[i];
        }
    }

    //Fail
    return null;
};

module.exports = Deck;
