'use strict';

var Deck = require ('./deck');

var Player = function (name) {
    this.name = name;
    this.ready = false;
    this.lives = Player.prototype.LIVES;
    this.won = 0;
    this.bet = '-';

    this.hand = new Deck();
};

Player.prototype.LIVES = 3;

Player.prototype.takeCard = function(card) {
    this.hand.push(card);
};

Player.prototype.play = function(cardName) {
    this.hand.remove(cardName);
};

Player.prototype.toString = function() {
    return ''+ this.hand;
};

module.exports = Player;
