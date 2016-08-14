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

var convertPlayer = function(player)
{
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

var createClientPlayerList = function(playerL)
{
    var clientPlayerList = [];

    for(var i = 0; i < playerL.length; i++)
    {
        clientPlayerList.push(convertPlayer(playerL[i]));
    }

    return clientPlayerList;
};

var isNameAvailable = function(name){
    for(var i in players)
    {
        if(players[i].name == name)
        {
            return false;
        }
    }

    return true;
};

var disconnect_C = function(socket){
    //Set name as socket name
	var name = socket.name;

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
        for (var i in players) {
            var player = players[i];

            player.ready = false;
            player.lives = 3;
            player.won = 0;
            player.bet = 0;
        }
    }

    //Reset socket name
    socket.name = null;

    //Update removed player to other clients
    socket.broadcast.emit('player-disconnect', name);
};

//Server connection code
io.on('connection', function (socket)
{
	socket.on('login', function (name, callback) {
        console.log(name + " login");

        var success = 0;

        //If name not available
        if (!isNameAvailable(name)) {
            success = 1;
        }
        //If game is full
        else if(players.length == 5) {
            success = 2;
        }
        //If game is on
        else if (game != null) {
            success = 3;
        }

        //Return playerlist and success to requested player
        callback(success);

        if (success == 0) {
            //Add new player to server player list and socket
    		socket.name = name;
    		var newPlayer = new Player (name);
            players.push(newPlayer);

            //Update new player to other clients
            socket.broadcast.emit('player-connect',convertPlayer(newPlayer));
        }
	});

    // Client = {name,ready}
	socket.on('ready', function(client) {
        console.log(client.name + " ready is " + client.ready);
		//Update player in server player list
		for(var i in players)
		{
			if (players[i].name == client.name)
			{
				players[i].ready = client.ready;
				socket.broadcast.emit('update-client-ready', client);
				//Probably unnecessary
				break;
			}
		}
	});

    //Player has done a bet
    socket.on('player-bet', function(bet) {
        console.log(socket.name + " betted " + bet);
        game.playerBet(socket.name, bet);
        var startPlayPhase = game.phase == "play";

        io.emit('bet-update', {
            "bet": bet,
            "playerWhoBet": socket.name,
            "nextPlayer": game.roundPlayer,
            "startPlayPhase": startPlayPhase
        });
    });

    //Player played a card
    socket.on('player-play-card', function(card) {
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
    });

    //Host client started game
    socket.on('start-game', function() {
        console.log("game started!");
        game = new Game (players);
        io.emit('game-start-notification', game.startMatchPlayer);
    });

    //Client requested his cards
    socket.on('request-cards', function(data, callback) {
        console.log(socket.name + " asked his cards");
        callback({
            'cards' : game.getCardsFromPlayer(socket.name)
        });
    });

    socket.on('request-playerlist', function(data, callback) {
        console.log(socket.name + " asked for playerlist");
        callback({
            'name' : socket.name,
            'playerList' : createClientPlayerList(players),
        })
    });

	socket.on('disconnect', function() {
        console.log(socket.name + " disconnected");
        disconnect_C(socket);
    });
});
