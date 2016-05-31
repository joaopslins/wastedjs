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
var game;

var convertPlayer = function(player)
{
    var clientPlayer = {
        name: player.name,
        ready:  player.ready,
        lives: player.lives,
        won: player.won,
        bet: player.bet,
        card: ""
    };

    return clientPlayer;
}

var createClientPlayerList = function()
{
    var clientPlayerList = [];

    for(var i = 0; i < players.length; i++)
    {
        clientPlayerList.push(convertPlayer(players[i]));
    }

    return clientPlayerList;
};

var isNameAvailable = function(name){
    for(i in players)
    {
        if(players[i].name == name)
        {
            return false;
        }
    }

    return true;
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
            "playerList" : createClientPlayerList(),
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

    socket.on('logout', function(name){
        //Remove player from server playlist
        players = players.filter(function (player)
        {
            return player.name != name;
        });

        //Update removed player to other clients
        socket.broadcast.emit('player-disconnect', name);
    });

    // Client = {name,ready}
	socket.on('ready', function(client)
	{
		//Update player in server player list
		for(i in players)
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

    socket.on('start-game', function(){

    });

	socket.on('disconnect', function(){
		//Set name as socket name
		var name = socket.name;

        //Remove player from server playlist
        players = players.filter(function (player)
        {
            return player.name != name;
        });

        //Update removed player to other clients
        socket.broadcast.emit('player-disconnect', name);
	});
});


/*
io.sockets.emit() - send to all connected clients
io.sockets.on() - initial connection from a client.

socket.on() - event listener, can be called on client to execute on server
socket.emit() - send to client who sent the message
socket.broadcast.emit() - send to all connected clients except the one that sent the message

*/
