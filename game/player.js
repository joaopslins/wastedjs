'use strict';

var Deck = require ('./deck');

var Player = function (name) {
    this.name = name;
    this.ready = false;
    this.lives = 3;
    this.won = 0;
    this.bet = '-';
    this.card = '';
    this.isAlive = true;

    this.hand = new Deck();
};

Player.prototype.takeCard = function(card) {
    this.hand.push(card);
};

Player.prototype.play = function(cardName) {
    this.hand.remove(cardName);
};

Player.prototype.toString = function() {
    return ''+ this.hand;
};

Player.prototype.loseLives = function() {
    let lostLives = Math.abs(this.won - this.bet);

    this.lives -= lostLives;

    //Check if player is out of the game
    if (this.lives <= 0) {
        this.isAlive = false;
    }
};

module.exports = Player;
