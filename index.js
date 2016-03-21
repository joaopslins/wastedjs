var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require ('socket.io') (server);

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

app.get('/', function(request, response) {
  response.sendFile(__dirname + "/public/index.html");
});

server.listen(app.get('port'), function () {
  console.log('Server listening at port %d', app.get('port'));
});

var numUsers = 0;

io.on('connection', function (socket)
{
	numUsers++;
	console.log(numUsers + " entrou");
	
	socket.on('send message', function (data)
	{
		console.log("chegou msg: " + data);
		io.sockets.emit('update message', data);
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