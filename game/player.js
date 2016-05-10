'use strict';

var Deck = require ('./deck');

var Player = function (name) {
    this.name = name;
    this.ready = false;
    this.lives = Player.prototype.LIVES;
    this.won = 0;
    this.bet = 0;

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

module.exports = Player;
