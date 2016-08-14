'use strict';

var Game = require ("./game");
var Player = require ("./player");

var Lobby = function() {
    this.game = null;
    this.players = [];
};

Lobby.prototype.addPlayer = function(playerName) {
    let newPlayer = new Player (playerName);
    this.players.push(newPlayer);

    return newPlayer;
};

Lobby.prototype.setReady = function(client) {
    for (let i in this.players) {
        if (this.players[i].name == client.name) {
            this.players[i].ready = client.ready;
            break;
        }
    }
};

Lobby.prototype.checkLogin = function (name) {
    if (!isNameAvailable(name, this.players)) {
        //If name not available
        return 1;
    } else if(this.players.length == 5) {
        //If game is full
        return 2;
    } else if (this.game != null) {
        //If game is on
        return 3;
    }

    return 0;
};

Lobby.prototype.startGame = function () {
    for (let i in this.players) {
        this.players[i].ready = false;
    }
    this.game = new Game (this.players);
};

Lobby.prototype.disconnect = function (name) {
    //If undefined, dont close game;
    if (name == null) {
        return;
    }

    //Remove player from server playlist
    this.players = this.players.filter(function (player) {
        return player.name != name;
    });

    //Undo game
    if (this.game !== null) {
        this.game = null;

        //Reset players
        for (let i in this.players) {
            this.players[i].ready = false;
        }
    }
};

function isNameAvailable(name, players) {
    for (let i in players) {
        if (players[i].name == name) {
            return false;
        }
    }

    return true;
};

module.exports = Lobby;
