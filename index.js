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
var Lobby = require ('./game/lobby');

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response) {
  response.sendFile(__dirname + "/public/index.html");
});


server.listen(app.get('port'), function () {
  console.log('Server listening at port %d', app.get('port'));
});

//Server Variables
var callInterval = 3000; //in ms
var lobby = new Lobby();

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
    socket.on('kick-player', kickPlayerCB);
	socket.on('disconnect', disconnectCB);

    //////////////////////////////
    // Function Implementations //
    //////////////////////////////

    function loginCB(name, callback) {
        console.log(name + " login");

        let success = lobby.checkLogin(name);

        //Return playerlist and success to requested player
        callback(success);

        if (success == 0) {
            //Add new player to server player list and socket
    		socket.name = name;
            let newPlayer = lobby.addPlayer(name);

            let convert = (player) => ({
                name: player.name,
                ready:  player.ready,
                lives: player.lives,
                won: player.won,
                bet: player.bet,
                isAlive: player.isAlive,
                card: ''
            });

            newPlayer = convert(newPlayer);

            //Update new player to other clients
            socket.broadcast.emit('player-connect', newPlayer);
        } else {
            console.log(name + " login denied");
        }
	};

    function readyCB(client) {
        console.log(client.name + " ready is " + client.ready);
		//Update player in server player list
	    lobby.setReady(client);
        socket.broadcast.emit('update-client-ready', client);
	};

    function playerBetCB(bet) {
        console.log(socket.name + " betted " + bet);
        lobby.game.playerBet(socket.name, bet);
        let startPlayPhase = lobby.game.phase == "play";

        io.emit('bet-update', {
            bet: bet,
            playerWhoBet: socket.name,
            nextPlayer: lobby.game.roundPlayer,
            startPlayPhase: startPlayPhase
        });
    };

    function playerPlayCB(card) {
        console.log(socket.name + " player card " + card);
        let game = lobby.game;
        game.playerPlayCard(socket.name, card);

        if (game.phase == 'end') {
            console.log("round over");
            //Round is over
            io.emit('play-update', {
                card: card,
                playerWhoPlayed: socket.name,
                nextPlayer: '',
                wonPlayer: game.winPlayer
            });
            game.roundEnd();

            if (game.phase == "endmatch") {
                setTimeout(function(){
                    io.emit('new-round', {
                        players: createClientPlayerList(game.players),
                        playerToPlay: ''
                    });

                    //Match is over
                    console.log("match over");
                    game.matchEnd();

                    if (game.phase == "endgame") {
                        console.log("game over");
                        setTimeout(function() {
                            lobby.game = null;
                            io.emit('end-game', createClientPlayerList(game.players));
                        }, callInterval);
                    } else if (game.phase == "bet"){
                        setTimeout(function() {
                            io.emit('new-match', {
                                players: createClientPlayerList(game.players),
                                playerToPlay: game.startMatchPlayer
                            });
                        }, callInterval);
                    }
                }, callInterval);

            } else {
                //Match is not over
                setTimeout(function() {
                    io.emit('new-round', {
                        players: createClientPlayerList(game.players),
                        playerToPlay: game.roundPlayer
                    });
                }, callInterval);
            }
        } else if (game.phase == 'play') {
            //Continue playing the same round
            io.emit('play-update', {
                card: card,
                playerWhoPlayed: socket.name,
                nextPlayer: game.roundPlayer
            });
        }
    };

    function startGameCB() {
        console.log("game started!");
        lobby.startGame();
        io.emit('game-start-notification', {
            startingPlayer: lobby.game.startMatchPlayer,
            playerList : createClientPlayerList(lobby.game.players)
        });
    };

    function requestCardsCB(data, callback) {
        console.log(socket.name + " asked his cards");
        callback({
            cards : lobby.game.getCardsFromPlayer(socket.name)
        });
    };

    function requestPlayerlistCB(data, callback) {
        console.log(socket.name + " asked for playerlist");
        callback({
            name : socket.name,
            playerList : createClientPlayerList(lobby.players),
        })
    };

    function kickPlayerCB(name) {
        console.log(name + " was kicked by " + socket.name );

        for(let i in io.sockets.connected) {
            if (io.sockets.connected[i].name == name) {
                io.sockets.connected[i].emit('kicked');
                io.sockets.connected[i].disconnect();
            }
        }
    };

    function disconnectCB() {
        console.log(socket.name + " disconnected");
        //if undefined, dont emit events
        if (socket.name) {
            lobby.disconnect(socket.name);

            socket.broadcast.emit('player-disconnect', socket.name);
        }
    };

    /////////////////////////////
    //    Utility Functions    //
    /////////////////////////////

    function createClientPlayerList(playerL) {
        var clientPlayerList = playerL.map(
            (player) => ({
                name: player.name,
                ready:  player.ready,
                lives: player.lives,
                won: player.won,
                bet: player.bet,
                isAlive: player.isAlive,
                card: ''
            })
        );

        return clientPlayerList;
    };
});
