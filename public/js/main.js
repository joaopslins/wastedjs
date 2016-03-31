$(function() {	
	var $messageInput = $(".messageInput");
	var $button = $(".button");
	var $message = $(".message");

	var socket = io(window.location.host);

	$button.click( function()
	{
		var messageI = $messageInput.val();
		if(messageI)
		{
			socket.emit('send message', messageI);
		}
	});

	socket.on('update message', function(data)
	{
		$message.text(data);
	});
});
