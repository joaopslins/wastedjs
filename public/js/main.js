var fodinhaJS = angular.module ("fodinhaJSapp", ["ngAnimate"]);

fodinhaJS.controller("fodinhaJSctrl", function($scope, $timeout)
{
	$scope.loggedIn = 'no';
	$scope.nick = "";

	$scope.loginToggle = function()
	{
		// If logging in
		if($scope.loggedIn == "no")
		{
			$scope.loggedIn = false;
			$timeout( function() {
				$scope.loggedIn = "yes";
			}, 500);
		}
		// If logging out
		else if($scope.loggedIn == "yes")
		{
			$scope.loggedIn = false;
			$timeout( function() {
				$scope.loggedIn = "no";
			}, 500);
		}

	}
});

// $(function() {
// 	var $button = $("#button");
//
// 	var socket = io(window.location.host);
//
// 	$button.click( function()
// 	{
// 		socket.emit('send message');
// 	});
//
// 	socket.on('update message', function(data)
// 	{
// 		$message.text(data);
// 	});
// });
