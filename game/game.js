'use strict';
var Deck = require ("./deck");
var Card = require ("./card");

//Executes when a game starts
var Game = function(players) {
    this.players = players;

    this.startMatchPlayer = players[0].name;

    this.startRoundPlayer = players[0].name;
    this.roundPlayer = this.startRoundPlayer;

    this.matchNumber = 2;
    this.phase = "bet";

    this.playersQty = players.length;

    this.winCard = null;
    this.winPlayer = '';
    this.isTied = false;

    this.startMatch(this.matchNumber);
};

Game.prototype.startMatch = function(matchNumber){
    //Reset Players
    for(var i in this.players){
        var player = this.players[i];

        player.won = 0;
        player.bet = '-';
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
};

Game.prototype.playerBet = function(name, bet){
    this.players[this.getPlayerIndex(name)].bet = bet;

    this.setNextPlayer();

    //End bet phase
    if(this.roundPlayer == this.startRoundPlayer){
        this.phase = "play";
        this.roundNumber = this.matchNumber;

        this.winCard = null;
        this.winPlayer = '';
        this.isTied = false;
    }
};

Game.prototype.playerPlayCard = function (name, card) {
    var cards = this.players[this.getPlayerIndex(name)].hand;
    var card = cards.getCard (card);

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

    this.setNextPlayer();

    //End round
    if (this.roundPlayer == this.startRoundPlayer) {
        this.phase = "end";
    }
};

Game.prototype.roundEnd = function() {
    this.roundNumber--;

    if (this.roundNumber > 0) {
        //Set win
        for (var i in this.players) {
            if (this.players[i].name == this.winPlayer && !this.isTied) {
                this.players[i].won++;
            }
        }

        //Set next round players
        this.startRoundPlayer = this.winPlayer;
        this.roundPlayer = this.winPlayer;
    } else {
        this.phase = "endmatch";
    }

}

module.exports = Game;
