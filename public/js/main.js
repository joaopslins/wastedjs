var fodinhaJS = angular.module ("fodinhaJSapp", ["ngAnimate"]);

fodinhaJS.controller("fodinhaJSctrl", function($scope, $timeout)
{
	$scope.loggedIn = 'no';
	$scope.nick = "";
	$scope.ready = false;

	$scope.loginToggle = function()
	{
		// If logging in
		if($scope.loggedIn == "no")
		{
			// Animation
			$scope.loggedIn = false;
			$timeout( function() {
				$scope.loggedIn = "yes";
			}, 500);

			//Add new player
			// TODO USING NODE SERVER
			$scope.players.push(
				{
					name : $scope.nick,
					ready : $scope.ready
				}
			);

		}
		// If logging out
		else if($scope.loggedIn == "yes")
		{
			// Animation
			$scope.loggedIn = false;
			$timeout( function() {
				$scope.loggedIn = "no";
			}, 500);

			//Remove current player
			// TODO USING NODE SERVER
			$scope.players = $scope.players.filter(function (player)
			{
				return player.name != $scope.nick;
			});
		}

		// Reset ready status
		$scope.ready = false;
	}

	$scope.readyToggle = function()
	{
		var i;
		for(i = 0; i < $scope.players.length; i++)
		{
			if($scope.players[i].name == $scope.nick)
			{
				console.log("achou");
				$scope.players[i].ready = !$scope.players[i].ready;
				break;
			}
		}
	}

	$scope.players = [
	{
		name : "Teste1",
		ready : false
	},
	{
		name : "Teste2",
		ready : false
	}
	];
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
