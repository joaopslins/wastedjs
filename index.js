var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require ('socket.io') (server);

// External Files
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

var convertPlayer = function(player)
{
    var clientPlayer = {
        name: player.name,
        ready:  player.ready,
        lives: player.lives,
        won: player.won,
        bet: player.bet,
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

    //Remove player from server playlist
    players = players.filter(function (player)
    {
        return player.name != name;
    });

    //Undo game
    if(game !== null){
        game = null;

        //Reset players
        for(var i in players){
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

//Server connection code
io.on('connection', function (socket)
{
    console.log("entrou");

	socket.on('login', function (name, callback)
	{
        var success = 0;
        //If name not available
        if(!isNameAvailable(name)){
            success = 1;
        }
        //If game is full
        else if(players.length == 5){
            success = 2;
        }

        //Return playerlist and success to requested player
        callback({
            "playerList" : createClientPlayerList(players),
            "success" : success
        });

        if(success == 0){
            //Add new player to server player list and socket
    		socket.name = name;
    		var newPlayer = new Player (name);
            players.push(newPlayer);

            //Update new player to other clients
            socket.broadcast.emit('player-connect',convertPlayer(newPlayer));
        }
	});

    socket.on('logout', function(){
        disconnect_C(socket);
    });

    // Client = {name,ready}
	socket.on('ready', function(client)
	{
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
    socket.on('player-bet', function(bet){
        game.playerBet(socket.name, bet);
        var startPlayPhase = game.phase == "play";

        io.emit('bet-update', bet, socket.name, game.roundPlayer, startPlayPhase);
    });

    //Player played a card
    socket.on('player-play-card', function(card) {
        game.playerPlayCard(socket.name, card);

        //End round
        if (game.phase == 'end') {
            io.emit('play-update', card, socket.name, game.roundPlayer, true);
            game.roundEnd();

            if (game.phase = "endmatch") {
                //End match
            } else {
                setTimeout(function(){
                    io.emit('new-round', createClientPlayerList(game.players), game.roundPlayer);
                }, 1000);
            }
        } else if (game.phase == 'play') {
            io.emit('play-update', card, socket.name, game.roundPlayer, false);
        }
    });

    //Host client started game
    socket.on('start-game', function(){
        game = new Game (players);
        io.emit('match-start-notification', game.startMatchPlayer);
    });

    //Client requested his cards
    socket.on('request-cards', function(data, callback){
        callback({
            'cards' : game.getCardsFromPlayer(socket.name)
        });
    });

	socket.on('disconnect', function(){
        disconnect_C(socket);
    });
});
