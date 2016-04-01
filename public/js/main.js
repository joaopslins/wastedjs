$(function() {
	var $button = $("#button");

	var socket = io(window.location.host);

	$button.click( function()
	{
		socket.emit('send message');
	});

	socket.on('update message', function(data)
	{
		$message.text(data);
	});
});
