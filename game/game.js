'use strict';
var Deck = require ("./deck");

//Executes when a game starts
var Game = function(players) {
    this.players = players;

    this.startMatchPlayer = players[0].name;

    this.startRoundPlayer = players[0].name;
    this.roundPlayer = this.startRoundPlayer;

    this.matchNumber = 2;
    this.phase = "bet";

    this.playersQty = players.length;

    this.startMatch(this.matchNumber);
};

Game.prototype.startMatch = function(matchNumber){
    //Reset Players
    for(var i in this.players){
        var player = this.players[i];

        player.won = 0;
        player.bet = 0;
    }

    //Distribute cards
    var deck = new Deck();
    deck.shuffle();
    deck.distribute(this.players, matchNumber);

    this.phase = "bet";
};

Game.prototype.getPlayerIndex = function(playerName){
    for(var i in this.players){
        if(this.players[i].name == playerName){
            return i;
        }
    }

    //Fail
    return null;
};

Game.prototype.getCardsFromPlayer = function(playerName){
    var player = this.players[this.getPlayerIndex(playerName)];

    return player.hand.getCards();
};

Game.prototype.setNextPlayer = function(){
    var index = this.getPlayerIndex(this.roundPlayer);
    index++;

    if(index == this.players.length){
        index = 0;
    }

    this.roundPlayer = this.players[index].name;
}

Game.prototype.playerBet = function(name, bet){
    this.players[this.getPlayerIndex(name)].bet = bet;

    this.setNextPlayer();

    if(this.roundPlayer == this.startRoundPlayer){
        this.phase = "play";
    }

};

module.exports = Game;
