var fodinhaJS = angular.module ("fodinhaJSapp", ["ngAnimate"]);

fodinhaJS.controller("fodinhaJSctrl", function($scope)
{
	$scope.loggedIn = false;
	$scope.nick = "";

	$scope.loginToggle = function()
	{
		// If logging in
		if(!$scope.loggedIn)
		{

		}
		// If logging out
		else
		{

		}

		$scope.loggedIn = !$scope.loggedIn;
	}
});

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
