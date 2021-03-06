'use strict';
var Deck = require ("./deck");
var Card = require ("./card");
var Player = require ("./player");

//Executes when a game starts
var Game = function(players) {
    this.players = players;

    this.startMatchPlayer = players[0].name;
    this.startRoundPlayer = players[0].name;
    this.roundPlayer = this.startRoundPlayer;
    this.matchNumber = 2;
    this.roundNumber = 0;

    this.playersQty = players.length;

    for (let i in this.players) {
        this.players[i].lives = 3;
        this.players[i].isAlive = true;
    }

    this.startMatch();
};

Game.prototype.startMatch = function(){
    //Phase and win configs
    this.phase = "bet";
    this.winCard = null;
    this.winPlayer = '';
    this.isTied = false;

    //Distribute cards
    let deck = new Deck();
    deck.shuffle();
    deck.distribute(this.players, this.matchNumber);

    //Reset Players
    for(let i in this.players){
        var player = this.players[i];

        player.won = 0;
        player.bet = '-';
        player.card = '';
        player.hand.sort();
    }

    this.phase = "bet";
};

Game.prototype.getPlayerIndex = function(playerName){
    for (let i in this.players) {
        if(this.players[i].name == playerName){
            return i;
        }
    }

    //Fail
    return null;
};

Game.prototype.getCardsFromPlayer = function(playerName){
    let player = this.players[this.getPlayerIndex(playerName)];

    return player.hand.getCards();
};

Game.prototype.setNextPlayer = function(isNextMatch){
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
        if (index == startIndex) {
            found = true;
        }
    }
};

Game.prototype.playerBet = function(name, bet) {
    this.players[this.getPlayerIndex(name)].bet = bet;

    this.setNextPlayer(false);

    //End bet phase
    if (this.roundPlayer == this.startRoundPlayer) {
        this.phase = "play";
        this.roundNumber = this.matchNumber;

        this.winCard = null;
        this.winPlayer = '';
        this.isTied = false;
    }
};

Game.prototype.playerPlayCard = function(name, cardStr) {
    let cards = this.players[this.getPlayerIndex(name)].hand;
    let card = cards.getCard (cardStr);

    //Updates winner card when someone plays
    if (this.winCard == null) {
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
    this.players[this.getPlayerIndex(name)].hand.remove(card.toString());

    this.setNextPlayer(false);

    //End round
    if (this.roundPlayer == this.startRoundPlayer) {
        this.phase = "end";
    }
};

Game.prototype.roundEnd = function() {
    this.roundNumber--;

    //Set win
    for (var i in this.players) {
        if (this.players[i].name == this.winPlayer && !this.isTied) {
            this.players[i].won++;
        }
    }

    //Set next round players
    this.startRoundPlayer = this.winPlayer;
    this.roundPlayer = this.winPlayer;

    //Set next phase
    if (this.roundNumber > 0) {
        this.phase = "play";
    } else {
        //Match ended
        this.phase = "endmatch";
    }

    //Set round win settings
    this.winCard = null;
    this.winPlayer = '';
    this.isTied = false;
};

Game.prototype.matchEnd = function() {
    let playersAlive = 0;

    //Reduce lives and reset settings
    for (let i in this.players) {
        this.players[i].loseLives();
        this.players[i].won = 0;
        this.players[i].bet = '-';
        this.card = '';

        if (this.players[i].isAlive) {
            playersAlive++;
        }
    }

    //Setting next player configs
    this.setNextPlayer(true);
    this.startRoundPlayer = this.startMatchPlayer;
    this.roundPlayer = this.startRoundPlayer;

    //Update match number and checks if game ended
    this.matchNumber++;
    if (this.matchNumber > 8 || playersAlive < 2) {
        this.phase = "endgame";
    } else {
        this.startMatch();
    }
};

module.exports = Game;
