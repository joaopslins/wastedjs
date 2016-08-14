'use strict';

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require ('socket.io') (server);

// External game files
var Card = require ('./game/card');
var Deck = require ('./game/deck');
var Player = require ('./game/player');
var Game = require ('./game/game');

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response) {
  response.sendFile(__dirname + "/public/index.html");
});

server.listen(app.get('port'), function () {
  console.log('Server listening at port %d', app.get('port'));
});

//Server Variables
var players = [];
var game = null;
var callInterval = 3000; //in ms

//Server connection code
io.on('connection', function (socket)
{
	socket.on('login', loginCB);
	socket.on('ready', readyCB);
    socket.on('player-bet',playerBetCB);
    socket.on('player-play-card', playerPlayCB);
    socket.on('start-game', startGameCB);
    socket.on('request-cards', requestCardsCB);
    socket.on('request-playerlist', requestPlayerlistCB);
	socket.on('disconnect', disconnectCB);

    //////////////////////////////
    // Function Implementations //
    //////////////////////////////

    function loginCB(name, callback) {
        console.log(name + " login");

        let success = 0;

        if (!isNameAvailable(name)) {
            //If name not available
            success = 1;
        } else if(players.length == 5) {
            //If game is full
            success = 2;
        } else if (game != null) {
            //If game is on
            success = 3;
        }

        //Return playerlist and success to requested player
        callback(success);

        if (success == 0) {
            //Add new player to server player list and socket
    		socket.name = name;
    		let newPlayer = new Player (name);
            players.push(newPlayer);

            //Update new player to other clients
            socket.broadcast.emit('player-connect',convertPlayer(newPlayer));
        }
	};

    function readyCB(client) {
        console.log(client.name + " ready is " + client.ready);
		//Update player in server player list
		for (let i in players) {
			if (players[i].name == client.name) {
				players[i].ready = client.ready;
				socket.broadcast.emit('update-client-ready', client);
				//Probably unnecessary
				break;
			}
		}
	};

    function playerBetCB(bet) {
        console.log(socket.name + " betted " + bet);
        game.playerBet(socket.name, bet);
        let startPlayPhase = game.phase == "play";

        io.emit('bet-update', {
            "bet": bet,
            "playerWhoBet": socket.name,
            "nextPlayer": game.roundPlayer,
            "startPlayPhase": startPlayPhase
        });
    };

    function playerPlayCB(card) {
        console.log(socket.name + " player card " + card);
        game.playerPlayCard(socket.name, card);

        if (game.phase == 'end') {
            console.log("round over");
            //Round is over
            io.emit('play-update', {
                "card": card,
                "playerWhoPlayed": socket.name,
                "nextPlayer": ''
            });
            game.roundEnd();

            if (game.phase == "endmatch") {
                setTimeout(function(){
                    io.emit('new-round', {
                        "players": createClientPlayerList(game.players),
                        "playerToPlay": ''
                    });

                    //Match is over
                    console.log("match over");
                    game.matchEnd();

                    if (game.phase == "endgame") {
                        console.log("game over");
                        setTimeout(function() {
                            io.emit('end-game', createClientPlayerList(game.players));
                        }, callInterval);
                    } else if (game.phase == "bet"){
                        setTimeout(function() {
                            io.emit('new-match', {
                                "players": createClientPlayerList(game.players),
                                "playerToPlay": game.startMatchPlayer
                            });
                        }, callInterval);
                    }
                }, callInterval);

            } else {
                //Match is not over
                setTimeout(function() {
                    io.emit('new-round', {
                        "players": createClientPlayerList(game.players),
                        "playerToPlay": game.roundPlayer
                    });
                }, callInterval);
            }
        } else if (game.phase == 'play') {
            //Continue playing the same round
            io.emit('play-update', {
                "card": card,
                "playerWhoPlayed": socket.name,
                "nextPlayer": game.roundPlayer
            });
        }
    };

    function startGameCB() {
        console.log("game started!");
        game = new Game (players);
        io.emit('game-start-notification', game.startMatchPlayer);
    };

    function requestCardsCB(data, callback) {
        console.log(socket.name + " asked his cards");
        callback({
            'cards' : game.getCardsFromPlayer(socket.name)
        });
    };

    function requestPlayerlistCB(data, callback) {
        console.log(socket.name + " asked for playerlist");
        callback({
            'name' : socket.name,
            'playerList' : createClientPlayerList(players),
        })
    };

    function disconnectCB() {
        console.log(socket.name + " disconnected");
    	let name = socket.name;

        //If undefined, dont close game;
        if (name == null) {
            return;
        }

        //Remove player from server playlist
        players = players.filter(function (player) {
            return player.name != name;
        });

        //Undo game
        if (game !== null) {
            game = null;

            //Reset players
            for (let i in players) {
                var player = players[i];

                player.ready = false;
                player.lives = 3;
                player.won = 0;
                player.bet = 0;
            }
        }

        //Update removed player to other clients
        socket.broadcast.emit('player-disconnect', name);
    };

    /////////////////////////////
    //    Utility Functions    //
    /////////////////////////////

    function convertPlayer(player) {
        var clientPlayer = {
            name: player.name,
            ready:  player.ready,
            lives: player.lives,
            won: player.won,
            bet: player.bet,
            isAlive: player.isAlive,
            card: ''
        };

        return clientPlayer;
    };

    function createClientPlayerList(playerL) {
        var clientPlayerList = [];

        for (var i = 0; i < playerL.length; i++) {
            clientPlayerList.push(convertPlayer(playerL[i]));
        }

        return clientPlayerList;
    };

    function isNameAvailable(name) {
        for (var i in players) {
            if (players[i].name == name) {
                return false;
            }
        }

        return true;
    };

});
