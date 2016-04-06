var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require ('socket.io') (server);

// External Files
var Game = require ('./game/game');

var Card = Game.card;
var Deck = Game.deck;
var Player = Game.player;

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response) {
  response.sendFile(__dirname + "/public/index.html");
});

server.listen(app.get('port'), function () {
  console.log('Server listening at port %d', app.get('port'));
});

var numUsers = 0;

io.on('connection', function (socket)
{
    var deck = new Deck ();
    deck.generate();

	socket.on('send message', function (data)
	{
		console.log("teste");
	});
	socket.on('disconnect', function(){
		console.log(numUsers + " saiu");
		numUsers--;
	});
});


/*
io.sockets.emit() - send to all connected clients (same as socket.emit)
io.sockets.on() - initial connection from a client.

socket.on() - event listener, can be called on client to execute on server
socket.emit() - send to client who sent the message
socket.broadcast.emit() - send to all connected clients except the one that sent the message

*/
